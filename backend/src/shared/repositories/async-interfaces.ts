import { Application, DepartmentQuota } from "../types";

// Async repository contracts used by the ranking module so its data source can
// be Neon (Prisma) at runtime and the in-memory store under test — without the
// service caring which. Mirrors the sync IApplicationRepository, promisified.

export interface IAsyncApplicationRepository {
  findById(applicationId: string): Promise<Application | undefined>;
  findAll(): Promise<Application[]>;
  findByDepartmentAndPeriod(
    departmentId: string,
    periodId: string
  ): Promise<Application[]>;
  save(application: Application): Promise<Application>;
}

export interface IAsyncQuotaRepository {
  find(
    departmentId: string,
    periodId: string
  ): Promise<DepartmentQuota | undefined>;
}
