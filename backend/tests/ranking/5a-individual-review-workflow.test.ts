import request from "supertest";
import { Express } from "express";
import { createApp } from "../../src/app";
import { AppContainer } from "../../src/shared/container";
import { ApplicationStatus } from "../../src/shared/types";
import { buildTestApplication } from "./ranking-test-helpers";

describe("Test Case 5A: Successful Individual Review Workflow", () => {
  let app: Express;
  let container: AppContainer;
  const applicationId = "app-workflow-test";

  beforeAll(() => {
    const created = createApp();
    app = created.app;
    container = created.container;

    // Seed: Application in IN_REVIEW_YGK status
    const application = buildTestApplication({
      applicationId,
      studentId: "student-workflow",
      studentTckn: "22222222222",
      studentFullName: "Test Student",
      periodId: "period-spring-2026",
      targetDepartmentId: "dept-computer-engineering",
      targetFacultyId: "faculty-engineering",
      transferType: "HORIZONTAL",
      targetSemester: 3,
      submittedGpa: 3.8,
      submittedYksScore: 450.0,
      yksExamYear: 2024,
      finishedSemester: 3,
      currentStatus: ApplicationStatus.InReviewYgk,
    });

    container.applications.put(application);
  });

  it("Step 1: should get eligibility data", async () => {
    const response = await request(app)
      .get(`/api/ranking/${applicationId}/eligibility`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(response.body.gpa).toBe(3.8);
    expect(response.body.activeSemester).toBe(3);
    expect(response.body.eligible).toBe(true);
    expect(response.body.warnings).toHaveLength(0);
  });

  it("Step 2: should save eligibility decision as eligible", async () => {
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/eligibility`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .send({ eligible: true })
      .expect(200);

    expect(response.body.message).toContain("proceed to department conditions");
    expect(response.body.eligible).toBe(true);
  });

  it("Step 3: should get department conditions (auto-pass)", async () => {
    const response = await request(app)
      .get(`/api/ranking/${applicationId}/conditions`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(response.body.hasConditions).toBe(false);
    expect(response.body.autoPass).toBe(true);
    expect(response.body.message).toBe("No dept. conditions — proceeding.");
  });

  it("Step 4: should save conditions decision as met", async () => {
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/conditions`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .send({ conditionsMet: true })
      .expect(200);

    expect(response.body.message).toContain("proceed to score calculation");
    expect(response.body.conditionsMet).toBe(true);
  });

  it("Step 5: should calculate score", async () => {
    const response = await request(app)
      .get(`/api/ranking/${applicationId}/score`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(response.body.yksScore).toBe(450);
    expect(response.body.gpa).toBe(3.8);
    // (450/500 * 0.90) + (3.8 * 0.10) = 0.81 + 0.38 = 1.19
    expect(response.body.calculatedScore).toBeCloseTo(1.19, 2);
    expect(response.body.formula).toBeDefined();
  });

  it("Step 6: should confirm score", async () => {
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/score/confirm`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .expect(200);

    expect(response.body.message).toContain("ready for ranking");

    // Verify score is saved
    const application = container.applications.findById(applicationId);
    expect(application?.transferScore).toBeCloseTo(1.19, 2);
    expect(application?.currentStatus).toBe(ApplicationStatus.InReviewYgk);
  });

  it("Step 7: should be ready for batch ranking", async () => {
    // Application now has confirmed score and is ready for ranking
    const application = container.applications.findById(applicationId);
    expect(application?.currentStatus).toBe(ApplicationStatus.InReviewYgk);
    expect(application?.transferScore).toBeDefined();
  });
});
