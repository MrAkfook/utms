import { prisma } from "../prisma-client";
import { Application, DepartmentQuota } from "../types";
import {
  toDomain,
  toPrismaCreate,
  toPrismaUpdate,
} from "../mappers/application-mapper";
import {
  IAsyncApplicationRepository,
  IAsyncQuotaRepository,
} from "./async-interfaces";
import {
  InMemoryApplicationRepository,
  InMemoryQuotaRepository,
} from "./in-memory";

// ─── Prisma (Neon) implementations — used at runtime ───────────────────────────

export class PrismaApplicationRepository implements IAsyncApplicationRepository {
  async findById(applicationId: string): Promise<Application | undefined> {
    const row = await prisma.application.findUnique({ where: { applicationId } });
    return row ? toDomain(row) : undefined;
  }

  async findAll(): Promise<Application[]> {
    const rows = await prisma.application.findMany();
    return rows.map(toDomain);
  }

  async findByDepartmentAndPeriod(
    departmentId: string,
    periodId: string
  ): Promise<Application[]> {
    const rows = await prisma.application.findMany({
      where: { targetDepartmentId: departmentId, periodId },
    });
    return rows.map(toDomain);
  }

  async save(application: Application): Promise<Application> {
    const row = await prisma.application.upsert({
      where: { applicationId: application.applicationId },
      create: toPrismaCreate(application),
      update: toPrismaUpdate(application),
    });
    return toDomain(row);
  }
}

export class PrismaQuotaRepository implements IAsyncQuotaRepository {
  async find(
    departmentId: string,
    periodId: string
  ): Promise<DepartmentQuota | undefined> {
    const row = await prisma.departmentApplicationInformation.findUnique({
      where: { departmentId_periodId: { departmentId, periodId } },
    });
    if (!row) return undefined;
    return {
      departmentId: row.departmentId,
      periodId: row.periodId,
      asilQuota: row.asilQuota ?? 0,
      yedekQuota: row.yedekQuota ?? 0,
    };
  }
}

// ─── In-memory adapters — promisified wrappers used under test ──────────────────

export class InMemoryAsyncApplicationRepository
  implements IAsyncApplicationRepository
{
  constructor(private readonly inner: InMemoryApplicationRepository) {}

  async findById(applicationId: string): Promise<Application | undefined> {
    return this.inner.findById(applicationId);
  }

  async findAll(): Promise<Application[]> {
    return this.inner.findAll();
  }

  async findByDepartmentAndPeriod(
    departmentId: string,
    periodId: string
  ): Promise<Application[]> {
    return this.inner.findByDepartmentAndPeriod(departmentId, periodId);
  }

  async save(application: Application): Promise<Application> {
    return this.inner.save(application);
  }
}

export class InMemoryAsyncQuotaRepository implements IAsyncQuotaRepository {
  constructor(private readonly inner: InMemoryQuotaRepository) {}

  async find(
    departmentId: string,
    periodId: string
  ): Promise<DepartmentQuota | undefined> {
    return this.inner.find(departmentId, periodId);
  }
}
