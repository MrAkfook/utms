import { Router } from "express";
import { requireRoles } from "../../shared/middleware/rbac";
import { UserRole } from "../../shared/types";
import { RankingService } from "./ranking.service";
import { RankingController } from "./ranking.controller";
import { AuditLogger } from "../../shared/audit/audit-logger";
import { AppContainer } from "../../shared/container";

export function buildRankingRouter(container: AppContainer): Router {
  const audit = new AuditLogger(container.audit);
  const service = new RankingService({
    applications: container.applications,
    audit,
  });
  const controller = new RankingController(service);
  const r = Router();

  // ─── Individual Application Review Routes ─────────────────────────────────

  /**
   * GET /api/ranking/quota/:departmentId/:periodId
   * Get pre-defined quota for a department/period
   * Requires: YGK Member or higher
   */
  r.get(
    "/quota/:departmentId/:periodId",
    requireRoles(UserRole.YgkMember, UserRole.YgkChair, UserRole.SystemAdmin),
    (req, res) => {
      const { departmentId, periodId } = req.params;
      const quota = container.quotas.find(departmentId, periodId);
      if (!quota) {
        return res.status(404).json({ error: "NOT_FOUND", message: "Bu bölüm/dönem için kota tanımlanmamış" });
      }
      return res.json(quota);
    }
  );

  /**
   * GET /api/ranking/queue
   * Get YGK queue - applications ready for review
   * Requires: YGK Member or higher
   */
  r.get(
    "/queue",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.getQueue
  );

  /**
   * POST /api/ranking/:applicationId/start-review
   * Start individual review of an application
   * Transitions from INTAKE_VERIFIED to IN_REVIEW_YGK
   * Requires: YGK Member or higher
   */
  r.post(
    "/:applicationId/start-review",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.startReview
  );

  /**
   * GET /api/ranking/:applicationId/eligibility
   * Get academic eligibility data for an application
   * Requires: YGK Member or higher
   */
  r.get(
    "/:applicationId/eligibility",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.getEligibility
  );

  /**
   * POST /api/ranking/:applicationId/eligibility
   * Save eligibility decision
   * Requires: YGK Member or higher
   */
  r.post(
    "/:applicationId/eligibility",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.saveEligibilityDecision
  );

  /**
   * GET /api/ranking/:applicationId/conditions
   * Get department conditions for an application
   * Requires: YGK Member or higher
   */
  r.get(
    "/:applicationId/conditions",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.getDepartmentConditions
  );

  /**
   * POST /api/ranking/:applicationId/conditions
   * Save department conditions decision
   * Requires: YGK Member or higher
   */
  r.post(
    "/:applicationId/conditions",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.saveConditionsDecision
  );

  /**
   * GET /api/ranking/:applicationId/score
   * Get score calculation for an application
   * Requires: YGK Member or higher
   */
  r.get(
    "/:applicationId/score",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.getScoreCalculation
  );

  /**
   * POST /api/ranking/:applicationId/score/confirm
   * Confirm and save score
   * Requires: YGK Member or higher
   */
  r.post(
    "/:applicationId/score/confirm",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.confirmScore
  );

  /**
   * POST /api/ranking/:applicationId/score/invalidate
   * Invalidate score (Go Back functionality)
   * Requires: YGK Member or higher
   */
  r.post(
    "/:applicationId/score/invalidate",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.SystemAdmin
    ),
    controller.invalidateScore
  );

  // ─── Batch Ranking Routes ─────────────────────────────────────────────────

  /**
   * POST /api/ranking/execute
   * Execute ranking for a department/period
   * Requires: YGK Chair role
   */
  r.post(
    "/execute",
    requireRoles(UserRole.YgkChair, UserRole.SystemAdmin),
    controller.execute
  );

  /**
   * GET /api/ranking/:departmentId/:periodId/results
   * Get ranking results for a department/period
   * Requires: YGK Member or higher
   */
  r.get(
    "/:departmentId/:periodId/results",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.DeansOfficeStaff,
      UserRole.SystemAdmin
    ),
    controller.getResults
  );

  /**
   * GET /api/ranking/:departmentId/:periodId/overview
   * Get department ranking overview (stats for dashboard)
   * Requires: YGK Member or higher
   */
  r.get(
    "/:departmentId/:periodId/overview",
    requireRoles(
      UserRole.YgkMember,
      UserRole.YgkChair,
      UserRole.DeansOfficeStaff,
      UserRole.SystemAdmin
    ),
    controller.getOverview
  );

  return r;
}
