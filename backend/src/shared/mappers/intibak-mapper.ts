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
