import { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

/**
 * Express 4 forwards synchronous throws to the error middleware but silently
 * drops rejected promises from async handlers. Wrapping an async handler routes
 * its rejection to next() so it reaches the shared errorHandler.
 */
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
