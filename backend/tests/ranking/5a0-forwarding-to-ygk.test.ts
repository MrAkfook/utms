import request from "supertest";
import { Express } from "express";
import { createApp } from "../../src/app";
import { AppContainer } from "../../src/shared/container";
import { ApplicationStatus } from "../../src/shared/types";
import { buildTestApplication } from "./ranking-test-helpers";

describe("Test Case 5A0: Successful Forwarding to YGK Queue", () => {
  let app: Express;
  let container: AppContainer;

  beforeAll(() => {
    const created = createApp();
    app = created.app;
    container = created.container;

    // Seed: Application ready to be forwarded to YGK
    const application = buildTestApplication({
      applicationId: "app-sevda-birkan",
      studentId: "student-sevda",
      studentTckn: "11111111111",
      studentFullName: "Sevda Birkan",
      periodId: "period-spring-2026",
      targetDepartmentId: "dept-computer-engineering",
      targetFacultyId: "faculty-engineering",
      transferType: "HORIZONTAL",
      targetSemester: 3,
      submittedGpa: 3.8,
      submittedYksScore: 450.0,
      yksExamYear: 2024,
      finishedSemester: 3,
      currentStatus: ApplicationStatus.IntakeVerified, // From Dean's Office
    });

    container.applications.put(application);
  });

  it("should start review and transition application to IN_REVIEW_YGK status", async () => {
    const response = await request(app)
      .post("/api/ranking/app-sevda-birkan/start-review")
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(response.body.message).toBe("Application review started");
    expect(response.body.status).toBe("IN_REVIEW_YGK");

    // Verify status change
    const application = container.applications.findById("app-sevda-birkan");
    expect(application?.currentStatus).toBe(ApplicationStatus.InReviewYgk);
  });

  it("should be idempotent if application is already IN_REVIEW_YGK", async () => {
    // Try to start review again (already IN_REVIEW_YGK) — should return 200 idempotently
    const response = await request(app)
      .post("/api/ranking/app-sevda-birkan/start-review")
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(response.body.message).toBe("Application review started");
    // Status should remain IN_REVIEW_YGK
    const application = container.applications.findById("app-sevda-birkan");
    expect(application?.currentStatus).toBe(ApplicationStatus.InReviewYgk);
  });

  it("should create audit log for review start", async () => {
    const auditEntries = container.audit.findAll();
    const reviewStartLog = auditEntries.find(
      (entry) =>
        entry.actionType === "YGK_REVIEW_STARTED" &&
        entry.affectedEntityId === "app-sevda-birkan"
    );

    expect(reviewStartLog).toBeDefined();
    expect(reviewStartLog?.actorRole).toBe("YGK_MEMBER");
  });
});
