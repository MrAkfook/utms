// Vercel serverless entry point for the Express backend.
// Lives at the repo root so Vercel (which deploys the frontend from root)
// also serves the backend API in the same deployment.
// pnpm workspace installs backend/node_modules during "pnpm install",
// so all Express / Prisma / Blob deps are available here.
import { createApp } from "../backend/src/app";

const { app } = createApp();

export default app;
