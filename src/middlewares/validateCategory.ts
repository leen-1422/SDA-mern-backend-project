import { NextFunction, Request, Response } from "express";
import zod, { ZodError } from "zod";
import ApiError from "../errors/ApiError";

export function validateCategory(req: Request, res: Response, next: NextFunction) {
  const schema = zod.object({
    name: zod.string().
    min(7, { message: "Name must have at least 7 characters" }).
    max(40, { message: "Name can have at most 40 characters" }),
  });

  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const err = error;
    if (err instanceof ZodError) {
      next(ApiError.badValidationRequest(err.errors));
    } else {
      next(ApiError.internal("something went wrong"));
    }
  }
}
