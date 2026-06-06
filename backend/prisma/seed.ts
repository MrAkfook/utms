/**
 * Seeds the Scenario 5 (YGK ranking) fixtures into Neon.
 *
 * Source of truth is src/mocks/seed-data — the same builders the in-memory
 * container uses for tests — so the DB and the test fixtures never drift.
 * Idempotent: re-running upserts every row by primary key.
 *
 * Run: npx ts-node prisma/seed.ts   (DATABASE_URL must point at Neon)
 */
import { PrismaClient } from "@prisma/client";
import { buildSeedApplications, buildSeedQuotas } from "../src/mocks/seed-data";
import { toPrismaCreate } from "../src/shared/mappers/application-mapper";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const apps = buildSeedApplications();
  for (const app of apps) {
    const data = toPrismaCreate(app);
    await prisma.application.upsert({
      where: { applicationId: app.applicationId },
      create: data,
      update: data,
    });
  }

  const quotas = buildSeedQuotas();
  for (const q of quotas) {
    await prisma.departmentApplicationInformation.upsert({
      where: {
        departmentId_periodId: {
          departmentId: q.departmentId,
          periodId: q.periodId,
        },
      },
      create: {
        departmentId: q.departmentId,
        periodId: q.periodId,
        asilQuota: q.asilQuota,
        yedekQuota: q.yedekQuota,
      },
      update: { asilQuota: q.asilQuota, yedekQuota: q.yedekQuota },
    });
  }

  console.log(
    `Seeded ${apps.length} applications and ${quotas.length} quotas into Neon.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
