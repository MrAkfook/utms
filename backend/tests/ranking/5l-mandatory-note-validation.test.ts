import request from "supertest";
import { Express } from "express";
import { createApp } from "../../src/app";
import { AppContainer } from "../../src/shared/container";
import { ApplicationStatus } from "../../src/shared/types";
import { buildTestApplication } from "./ranking-test-helpers";

describe("Test Case 5L: Decision Blocked - Mandatory Note Not Entered", () => {
  let app: Express;
  let container: AppContainer;

  beforeEach(() => {
    const created = createApp();
    app = created.app;
    container = created.container;
  });

  it("should require note when marking application as not eligible", async () => {
    const applicationId = "app-note-test-1";
    const application = buildTestApplication({
      applicationId,
      studentId: "student-note-1",
      studentTckn: "44444444444",
      studentFullName: "Note Test Student 1",
      periodId: "period-spring-2026",
      targetDepartmentId: "dept-computer-engineering",
      targetFacultyId: "faculty-engineering",
      transferType: "HORIZONTAL",
      targetSemester: 3,
      submittedGpa: 3.1,
      submittedYksScore: 460.0,
      yksExamYear: 2024,
      finishedSemester: 4,
      currentStatus: ApplicationStatus.InReviewYgk,
    });

    container.applications.put(application);

    // Try to save ineligible decision without note
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/eligibility`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .send({ eligible: false })
      .expect(400);

    expect(response.body.error).toBe("VALIDATION_ERROR");
    expect(response.body.message).toContain("note is required");

    // Verify application status unchanged
    const app2 = container.applications.findById(applicationId);
    expect(app2?.currentStatus).toBe(ApplicationStatus.InReviewYgk);
  });

  it("should accept decision when note is provided", async () => {
    const applicationId = "app-note-test-2";
    const application = buildTestApplication({
      applicationId,
      studentId: "student-note-2",
      studentTckn: "55555555555",
      studentFullName: "Note Test Student 2",
      periodId: "period-spring-2026",
      targetDepartmentId: "dept-computer-engineering",
      targetFacultyId: "faculty-engineering",
      transferType: "HORIZONTAL",
      targetSemester: 3,
      submittedGpa: 3.1,
      submittedYksScore: 460.0,
      yksExamYear: 2024,
      finishedSemester: 4,
      currentStatus: ApplicationStatus.InReviewYgk,
    });

    container.applications.put(application);

    // Save ineligible decision WITH note
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/eligibility`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .send({
        eligible: false,
        note: "Student is in semester 4. Only 3rd or 5th semester students are eligible.",
      })
      .expect(200);

    expect(response.body.message).toContain("not eligible");

    // Verify application is flagged
    const app2 = container.applications.findById(applicationId);
    expect(app2?.currentStatus).toBe(ApplicationStatus.RankedRed);
    expect(app2?.rejectionReason).toContain("semester 4");
  });

  it("should require note when marking conditions as not met", async () => {
    const applicationId = "app-note-test-3";
    const application = buildTestApplication({
      applicationId,
      studentId: "student-note-3",
      studentTckn: "66666666666",
      studentFullName: "Note Test Student 3",
      periodId: "period-spring-2026",
      targetDepartmentId: "dept-architecture",
      targetFacultyId: "faculty-architecture",
      transferType: "HORIZONTAL",
      targetSemester: 3,
      submittedGpa: 2.8,
      submittedYksScore: 440.0,
      yksExamYear: 2024,
      finishedSemester: 3,
      currentStatus: ApplicationStatus.InReviewYgk,
    });

    container.applications.put(application);

    // Try to save conditions not met without note
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/conditions`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .send({ conditionsMet: false })
      .expect(400);

    expect(response.body.error).toBe("VALIDATION_ERROR");
    expect(response.body.message).toContain("note is required");
  });

  it("should accept conditions decision when note is provided", async () => {
    const applicationId = "app-note-test-4";
    const application = buildTestApplication({
      applicationId,
      studentId: "student-note-4",
      studentTckn: "77777777777",
      studentFullName: "Note Test Student 4",
      periodId: "period-spring-2026",
      targetDepartmentId: "dept-architecture",
      targetFacultyId: "faculty-architecture",
      transferType: "HORIZONTAL",
      targetSemester: 3,
      submittedGpa: 2.8,
      submittedYksScore: 440.0,
      yksExamYear: 2024,
      finishedSemester: 3,
      currentStatus: ApplicationStatus.InReviewYgk,
    });

    container.applications.put(application);

    // Save conditions not met WITH note
    const response = await request(app)
      .post(`/api/ranking/${applicationId}/conditions`)
      .set("x-mock-user", "user-ygk-cmpe-1")
      .send({
        conditionsMet: false,
        note: "Design Studio grade is BB, minimum AA is required. Portfolio document has not been uploaded.",
      })
      .expect(200);

    expect(response.body.message).toContain("flagged");

    // Verify application is flagged
    const app2 = container.applications.findById(applicationId);
    expect(app2?.currentStatus).toBe(ApplicationStatus.RankedRed);
    expect(app2?.rejectionReason).toContain("Design Studio");
  });
});
