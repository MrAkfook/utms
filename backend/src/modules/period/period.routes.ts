import { Router, Request, Response } from "express";
import { prisma } from "../../shared/prisma-client";

export function buildPeriodRouter(): Router {
  const r = Router();

  r.get("/active", async (_req: Request, res: Response) => {
    const period = await prisma.period.findFirst({ where: { isActive: true } });
    if (!period) {
      res.status(404).json({ error: "NO_ACTIVE_PERIOD" });
      return;
    }
    res.json({
      periodId: period.periodId,
      name: period.name,
      startDate: period.startDate.toISOString().split("T")[0],
      endDate: period.endDate.toISOString().split("T")[0],
      isActive: period.isActive,
    });
  });

  return r;
}
