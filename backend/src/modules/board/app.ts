import express, { Express, Request, Response } from "express";
import { AppContainer, createContainer } from "./shared/container";
import { mockAuthMiddleware } from "./shared/middleware/mock-auth";
import { errorHandler } from "./shared/middleware/error-handler";
import { buildOidbRouter } from "./modules/oidb/oidb.routes";
import { buildIntibakRouter } from "./modules/intibak/intibak.routes";
import { buildBoardRouter } from "./modules/board/board.routes";

export interface CreateAppOptions {
  container?: AppContainer;
}

export function createApp(
  options: CreateAppOptions = {},
): { app: Express; container: AppContainer } {
  const container = options.container ?? createContainer();
  const app = express();

  app.use(express.json({ limit: "12mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      scope:
        "Scenario 4 (OIDB), Scenario 6 (Intibak), Scenario 7 (Faculty Board)",
    });
  });

  const auth = mockAuthMiddleware(container);
  app.use("/api/oidb", auth, buildOidbRouter(container));
  app.use("/api/ygk", auth, buildIntibakRouter(container));
  app.use("/api/board", auth, buildBoardRouter(container));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "NOT_FOUND" });
  });
  app.use(errorHandler);

  return { app, container };
}
