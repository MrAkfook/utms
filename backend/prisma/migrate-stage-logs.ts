/**
 * One-time backfill: creates ApplicationStageLog rows for every existing
 * application based on its current status, timestamps, and routing flags.
 *
 * Safe to re-run — uses upsert on (applicationId, stageKey).
 *
 * Run with:
 *   npx ts-node --transpile-only prisma/migrate-stage-logs.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STATUS_RANK: Record<string, number> = {
  DRAFT: 0,
  PENDING_DOCUMENT_UPLOAD: 1,
  RETURNED_FOR_CORRECTION: 2,
  PENDING_OIDB_VERIFICATION: 3,
  INTAKE_VERIFIED: 4,
  REJECTED_AT_INTAKE: 4,
  PENDING_YGK_FORWARDING: 5,
  IN_REVIEW_YDYO: 6,
  IN_REVIEW_YGK: 7,
  RANKED_ASIL: 8,
  RANKED_YEDEK: 8,
  RANKED_RED: 8,
  RESULTS_PUBLISHED: 9,
};

function rank(status: string): number {
  return STATUS_RANK[status] ?? 0;
}

async function main() {
  const applications = await prisma.application.findMany({
    include: {
      intibakTables: { orderBy: { createdAt: "asc" } },
      documents: {
        include: { versions: { where: { isActive: true }, orderBy: { uploadedAt: "asc" } } },
      },
    },
  });

  console.log(`Backfilling stage logs for ${applications.length} application(s)…`);
  let total = 0;

  for (const app of applications) {
    const r = rank(app.currentStatus);
    const entries: {
      stageKey: string;
      actorName: string | null;
      actorRole: string | null;
      occurredAt: Date;
      notes: string | null;
    }[] = [];

    // ── Step 1: APPLICATION_CREATED ──────────────────────────────────────────
    entries.push({
      stageKey: "APPLICATION_CREATED",
      actorName: app.studentFullName,
      actorRole: "Öğrenci",
      occurredAt: app.submittedAt,
      notes: null,
    });

    // ── Step 2: DOCUMENT_UPLOAD ───────────────────────────────────────────────
    // Use the earliest active document version's upload time, falling back to
    // submittedAt when no documents exist yet.
    if (r >= 3) {
      const earliestUpload = app.documents
        .flatMap((d) => d.versions)
        .sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime())[0];
      entries.push({
        stageKey: "DOCUMENT_UPLOAD",
        actorName: app.studentFullName,
        actorRole: "Öğrenci",
        occurredAt: earliestUpload?.uploadedAt ?? app.submittedAt,
        notes: null,
      });
    }

    // ── Step 3: OIDB_INTAKE ───────────────────────────────────────────────────
    if (r >= 4) {
      let oidbNotes: string | null = null;
      if (app.currentStatus === "REJECTED_AT_INTAKE" && app.rejectionReason) {
        oidbNotes = `Red gerekçesi: ${app.rejectionReason}`;
      }
      const correctionReasons = Array.isArray(app.correctionReasons)
        ? (app.correctionReasons as string[])
        : [];
      if (correctionReasons.length > 0) {
        oidbNotes = `Düzeltme talepleri: ${correctionReasons.join(", ")}`;
      }
      entries.push({
        stageKey: "OIDB_INTAKE",
        actorName: app.intakeVerifiedBy ?? null,
        actorRole: "ÖİDB Personeli",
        occurredAt: app.intakeVerifiedAt ?? app.lastModifiedAt,
        notes: oidbNotes,
      });
    }

    // ── Step 4: YDYO_REVIEW ───────────────────────────────────────────────────
    // Completed if: ydyoExempt and rank >= 5, or actively routed and rank >= 7
    if ((app.ydyoExempt && r >= 5) || r >= 7) {
      entries.push({
        stageKey: "YDYO_REVIEW",
        actorName: null,
        actorRole: "YDYO Komisyonu",
        occurredAt: app.lastModifiedAt,
        notes: app.ydyoExempt ? "Dil yeterlilik muafiyeti tanındı." : null,
      });
    }

    // ── Step 5: YGK_ACADEMIC ─────────────────────────────────────────────────
    if (r >= 8) {
      entries.push({
        stageKey: "YGK_ACADEMIC",
        actorName: null,
        actorRole: "YGK Komisyonu",
        occurredAt: app.lastModifiedAt,
        notes: null,
      });
    }

    // ── Step 6: YGK_RANKING ───────────────────────────────────────────────────
    if (r >= 8) {
      const cat =
        app.rankingCategory === "ASIL"
          ? "Asil Liste"
          : app.rankingCategory === "YEDEK"
          ? "Yedek Liste"
          : app.rankingCategory === "RED"
          ? "Red"
          : null;
      entries.push({
        stageKey: "YGK_RANKING",
        actorName: null,
        actorRole: "YGK Komisyonu",
        occurredAt: app.lastModifiedAt,
        notes: cat ? `Sonuç: ${cat}` : null,
      });
    }

    // ── Step 7: INTIBAK ───────────────────────────────────────────────────────
    const lockedIntibak = app.intibakTables.find((t) => t.isLocked);
    if (lockedIntibak) {
      entries.push({
        stageKey: "INTIBAK",
        actorName: lockedIntibak.createdBy ?? null,
        actorRole: "YGK Komisyonu",
        occurredAt: lockedIntibak.savedAt ?? lockedIntibak.createdAt,
        notes: null,
      });
    }

    // ── Step 8: DEAN_REVIEW ───────────────────────────────────────────────────
    if (app.routedToDeansOffice && r >= 9) {
      entries.push({
        stageKey: "DEAN_REVIEW",
        actorName: null,
        actorRole: "Dekan",
        occurredAt: app.lastModifiedAt,
        notes: null,
      });
    }

    // ── Step 9: BOARD_APPROVAL ────────────────────────────────────────────────
    if (r >= 9) {
      entries.push({
        stageKey: "BOARD_APPROVAL",
        actorName: null,
        actorRole: "Fakülte Yönetim Kurulu",
        occurredAt: app.lastModifiedAt,
        notes: null,
      });
    }

    // ── Step 10: RESULTS_PUBLISHED ────────────────────────────────────────────
    if (app.currentStatus === "RESULTS_PUBLISHED") {
      entries.push({
        stageKey: "RESULTS_PUBLISHED",
        actorName: null,
        actorRole: "ÖİDB Personeli",
        occurredAt: app.lastModifiedAt,
        notes: null,
      });
    }

    // Upsert all entries for this application
    for (const entry of entries) {
      await prisma.applicationStageLog.upsert({
        where: {
          applicationId_stageKey: {
            applicationId: app.applicationId,
            stageKey: entry.stageKey,
          },
        },
        update: {
          actorName: entry.actorName,
          actorRole: entry.actorRole,
          occurredAt: entry.occurredAt,
          notes: entry.notes,
        },
        create: {
          applicationId: app.applicationId,
          stageKey: entry.stageKey,
          actorName: entry.actorName,
          actorRole: entry.actorRole,
          occurredAt: entry.occurredAt,
          notes: entry.notes,
        },
      });
      total++;
    }

    console.log(
      `  ${app.applicationId.slice(0, 8)}… [${app.currentStatus}] → ${entries.length} log(s)`
    );
  }

  console.log(`\nDone. Upserted ${total} stage log row(s) across ${applications.length} application(s).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
