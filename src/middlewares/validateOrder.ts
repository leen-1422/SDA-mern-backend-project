import { NextFunction, Request, Response } from "express";
import zod, { ZodError } from "zod";
import ApiError from "../errors/ApiError";

export function validateOrder(req: Request, res: Response, next: NextFunction) {
  const schema = zod.object({
    firstName: zod.string()
    .min(7, { message: "Name must have at least 7 characters" })
    .max(20, { message: "Name can have at most 20 characters" }),
    userId: zod.string(),
    purchasedAt: zod.string(),
    quantity: zod.number()
    .int().min(1, { message: "Quantity must be at least 1" }), 
    products: zod.array(
      zod.object({
        product: zod.string(),
        quantity: zod.number()
    .int().min(1, { message: "Quantity must be at least 1" }), 
      })
    ),
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
