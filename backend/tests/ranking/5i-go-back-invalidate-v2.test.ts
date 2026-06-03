import request from "supertest";
import { Express } from "express";
import { createApp } from "../../src/app";
import { AppContainer } from "../../src/shared/container";
import { ApplicationStatus } from "../../src/shared/types";
import { buildTestApplication } from "./ranking-test-helpers";

describe("Test Case 5I: Score Invalidated - Go Back (Individual Review)", () => {
  let app: Express;
  let container: AppContainer;
  const applicationId = "app-goback-test";

  beforeAll(() => {
    const created = createApp();
    app = created.app;
    container = created.container;

    // Seed: Application in IN_REVIEW_YGK with confirmed score
    const application = buildTestApplication({
      applicationId,
      studentId: "student-goback",
      studentTckn: "33333333333",
      studentFullName: "Go Back Test Student",
      periodId: "period-spring-2026",
      targetDepartmentId: "dept-computer-engineering",
      targetFacultyId: "faculty-engineering",
      transferType: "HORIZONTAL",
      targetSemester: 3,
      submittedGpa: 3.5,
      submittedYksScore: 480.0,
      yksExamYear: 2024,
      finishedSemester: 3,
      currentStatus: ApplicationStatus.InReviewYgk,
    });

    // Simulate confirmed score
    application.transferScore = 1.214; // Pre-calculated

    container.applications.put(application);
  });

  it("should show score is confirmed", () => {
    const application = container.applications.findById(applicationId);
    expect(application?.transferScore).toBeDefined();
    expect(application?.transferScore).toBeCloseTo(1.214, 3);
  });

  it("should invalidate score when 'Go Back' is clicked", async () => {
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/score/invalidate`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(response.body.message).toContain("Score invalidated");
    expect(response.body.message).toContain("re-verify");

    // Verify score is cleared
    const application = container.applications.findById(applicationId);
    expect(application?.transferScore).toBeUndefined();
    expect(application?.currentStatus).toBe(ApplicationStatus.InReviewYgk);
  });

  it("should allow re-confirming score after invalidation", async () => {
    // Recalculate and confirm
    const calcResponse = await request(app)
      .get(`/api/ranking/${applicationId}/score`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(calcResponse.body.calculatedScore).toBeCloseTo(1.214, 3);

    // Confirm again
    const confirmResponse = await request(app)
      .post(`/api/ranking/${applicationId}/score/confirm`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(confirmResponse.body.message).toContain("ready for ranking");

    // Verify score is saved again
    const application = container.applications.findById(applicationId);
    expect(application?.transferScore).toBeCloseTo(1.214, 3);
  });

  it("should create audit log for score invalidation", async () => {
    const auditEntries = container.audit.findAll();
    const invalidateLog = auditEntries.find(
      (entry) =>
        entry.actionType === "SCORE_INVALIDATED" &&
        entry.affectedEntityId === applicationId
    );

    expect(invalidateLog).toBeDefined();
    expect(invalidateLog?.actorRole).toBe("YGK_MEMBER");
  });
});
