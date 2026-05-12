import { prisma } from "../../shared/prisma-client";
import { ApplicationStatus } from "../../shared/types";

export interface CreateApplicationDto {
  studentTckn: string;
  studentFullName: string;
  periodId: string;
  targetDepartmentId: string;
  targetFacultyId: string;
  transferType: string;
  targetSemester: number;
  submittedGpa: number;
  submittedYksScore?: number;
  yksExamYear?: number;
  currentInstitution?: string;
  currentDepartment?: string;
}

export interface ApplicationSummaryDto {
  applicationId: string;
  targetDepartmentId: string;
  targetFacultyId: string;
  currentStatus: string;
  submittedAt: string;
  lastModifiedAt: string;
  uploadedDocumentCount: number;
}

export class ApplicationService {
  async listByStudent(studentId: string): Promise<ApplicationSummaryDto[]> {
    const apps = await prisma.application.findMany({
      where: { studentId },
      include: {
        documents: {
          include: { versions: { where: { isActive: true } } },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return apps.map((a) => ({
      applicationId: a.applicationId,
      targetDepartmentId: a.targetDepartmentId,
      targetFacultyId: a.targetFacultyId,
      currentStatus: a.currentStatus,
      submittedAt: a.submittedAt.toISOString(),
      lastModifiedAt: a.lastModifiedAt.toISOString(),
      uploadedDocumentCount: a.documents.filter((d) => d.versions.length > 0).length,
    }));
  }

  async create(studentId: string, dto: CreateApplicationDto): Promise<{ applicationId: string }> {
    const application = await prisma.application.create({
      data: {
        studentId,
        studentTckn: dto.studentTckn,
        studentFullName: dto.studentFullName,
        periodId: dto.periodId,
        targetDepartmentId: dto.targetDepartmentId,
        targetFacultyId: dto.targetFacultyId,
        transferType: dto.transferType,
        targetedSemester: dto.targetSemester,
        submittedGpa: dto.submittedGpa,
        submittedYksScore: dto.submittedYksScore,
        yksExamYear: dto.yksExamYear,
        currentInstitution: dto.currentInstitution,
        currentDepartment: dto.currentDepartment,
        currentStatus: ApplicationStatus.PendingDocumentUpload,
      },
    });
    return { applicationId: application.applicationId };
  }
}
