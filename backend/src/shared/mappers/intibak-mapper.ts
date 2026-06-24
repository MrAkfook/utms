import { Prisma } from "@prisma/client";
import {
  IntibakTable,
  MappingEntry,
  PreviousCourse,
  TargetCourse,
} from "../types";

export type PrismaIntibakRow = Prisma.IntibakTableGetPayload<Record<string, never>>;

/** Map a Neon `intibak_tables` row onto the domain IntibakTable. */
export function intibakToDomain(row: PrismaIntibakRow): IntibakTable {
  return {
    intibakTableId: row.intibakTableId,
    applicationId: row.applicationId,
    previousCourses: (row.previousCourses as unknown as PreviousCourse[]) ?? [],
    targetCurriculum: (row.targetCurriculum as unknown as TargetCourse[]) ?? [],
    mappings: (row.mappings as unknown as MappingEntry[]) ?? [],
    manualEntryUsed: row.manualEntryUsed,
    noSuggestionsFound: row.noSuggestionsFound,
    isLocked: row.isLocked,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    savedAt: row.savedAt ? row.savedAt.toISOString() : undefined,
  };
}

/**
 * Build the full set of scalar columns to upsert a domain IntibakTable into Neon.
 * JSON columns (previous/target/mappings) are stored as-is; createdAt is set on
 * create so re-saves of the same row keep the original timestamp.
 */
export function intibakToPrismaUpsert(
  table: IntibakTable
): Prisma.IntibakTableUncheckedCreateInput {
  return {
    intibakTableId: table.intibakTableId,
    applicationId: table.applicationId,
    previousCourses: table.previousCourses as unknown as Prisma.InputJsonValue,
    targetCurriculum: table.targetCurriculum as unknown as Prisma.InputJsonValue,
    mappings: table.mappings as unknown as Prisma.InputJsonValue,
    manualEntryUsed: table.manualEntryUsed,
    noSuggestionsFound: table.noSuggestionsFound,
    isLocked: table.isLocked,
    createdBy: table.createdBy,
    createdAt: new Date(table.createdAt),
    savedAt: table.savedAt ? new Date(table.savedAt) : null,
  };
}
