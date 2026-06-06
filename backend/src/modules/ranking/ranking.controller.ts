import { Request, Response } from "express";
import { z } from "zod";
import { RankingService } from "./ranking.service";
import { UnauthorizedError } from "../../shared/errors";

const ExecuteRankingSchema = z.object({
  departmentId: z.string().min(1, "departmentId is required"),
  periodId: z.string().min(1, "periodId is required"),
  quota: z.number().int().positive("Quota must be a positive number"),
});

const EligibilityDecisionSchema = z.object({
  eligible: z.boolean(),
  note: z.string().optional(),
});

const ConditionsDecisionSchema = z.object({
  conditionsMet: z.boolean(),
  note: z.string().optional(),
});

export class RankingController {
  constructor(private readonly service: RankingService) {}

  execute = async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUser(req);
    const body = ExecuteRankingSchema.parse(req.body);

    const result = await this.service.executeRanking({
      departmentId: body.departmentId,
      periodId: body.periodId,
      quota: body.quota,
      actorUserId: userId,
    });

    res.json({
      ...result,
      message: `Ranking completed: ${result.eligible} eligible, ${result.asilCount} Asil, ${result.yedekCount} Yedek, ${result.redCount} Red`,
    });
  };

  getResults = async (req: Request, res: Response): Promise<void> => {
    this.requireUser(req);
    const { departmentId, periodId } = req.params;

    const results = await this.service.getRankingResults(departmentId, periodId);

    res.json({
      results,
      message: `Retrieved ${results.length} ranked applications`,
    });
  };

  getOverview = async (req: Request, res: Response): Promise<void> => {
    this.requireUser(req);
    const { departmentId, periodId } = req.params;

    const overview = await this.service.getDepartmentOverview(
      departmentId,
      periodId
    );

    res.json({
      overview,
      message: "Department ranking overview retrieved",
    });
  };

  // ─── Individual Review Methods ────────────────────────────────────────────

  getQueue = async (req: Request, res: Response): Promise<void> => {
    this.requireUser(req);
    const applications = await this.service.getYgkQueue();

    res.json({
      applications,
      count: applications.length,
      message: `Retrieved ${applications.length} applications in YGK queue`,
    });
  };

  startReview = async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUser(req);
    const { applicationId } = req.params;

    await this.service.startApplicationReview(applicationId, userId);

    res.json({
      message: "Application review started",
      applicationId,
      status: "IN_REVIEW_YGK",
    });
  };

  getEligibility = async (req: Request, res: Response): Promise<void> => {
    this.requireUser(req);
    const { applicationId } = req.params;

    const data = await this.service.getEligibilityData(applicationId);

    res.json(data);
  };

  saveEligibilityDecision = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userId = this.requireUser(req);
    const { applicationId } = req.params;
    const body = EligibilityDecisionSchema.parse(req.body);

    await this.service.saveEligibilityDecision(applicationId, {
      eligible: body.eligible,
      note: body.note,
      actorUserId: userId,
    });

    res.json({
      message: body.eligible
        ? "Eligibility confirmed - proceed to department conditions"
        : "Application marked as not eligible",
      eligible: body.eligible,
    });
  };

  getDepartmentConditions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    this.requireUser(req);
    const { applicationId } = req.params;

    const data = await this.service.getDepartmentConditions(applicationId);

    res.json(data);
  };

  saveConditionsDecision = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const userId = this.requireUser(req);
    const { applicationId } = req.params;
    const body = ConditionsDecisionSchema.parse(req.body);

    await this.service.saveConditionsDecision(applicationId, {
      conditionsMet: body.conditionsMet,
      note: body.note,
      actorUserId: userId,
    });

    res.json({
      message: body.conditionsMet
        ? "Department conditions met - proceed to score calculation"
        : "Application flagged - conditions not met",
      conditionsMet: body.conditionsMet,
    });
  };

  getScoreCalculation = async (req: Request, res: Response): Promise<void> => {
    this.requireUser(req);
    const { applicationId } = req.params;

    const data = await this.service.calculateScoreForReview(applicationId);

    res.json(data);
  };

  confirmScore = async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUser(req);
    const { applicationId } = req.params;

    await this.service.confirmScore(applicationId, userId);

    res.json({
      message: "Score confirmed and saved - application ready for ranking",
      applicationId,
    });
  };

  invalidateScore = async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUser(req);
    const { applicationId } = req.params;

    await this.service.invalidateScore(applicationId, userId);

    res.json({
      message: "Score invalidated. Please re-verify eligibility.",
      applicationId,
    });
  };

  private requireUser(req: Request): string {
    if (!req.authUser) throw new UnauthorizedError();
    return req.authUser.userId;
  }
}
