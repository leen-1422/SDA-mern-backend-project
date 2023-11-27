import { parse } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import zod, { ZodError } from 'zod'
import ApiError from '../errors/ApiError'


export function validateUser(req: Request, res: Response, next: NextFunction) {
  const Schema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
  })
  try {
    const vaildatedUser = Schema.parse(req.body)
    req.validateUser= vaildatedUser
    next()
  } catch (error) {
    const err = error
    if (err instanceof ZodError) {
      next(ApiError.badValidationRequest(err.errors))
      return
    }
    next(ApiError.internal('somthing went wrong'))
  }
}

export function ValidateProducts(req: Request, res: Response, next: NextFunction) {
  const Schema = zod.object({
    name: zod.string().min(1).max(255),
    image: zod.string().url(),
    category: zod.string(),
    description: zod.string(),
    sizes: zod.array(zod.string()),
    price: zod.number().min(0),
  })
  try {
    Schema.parse(req.body)
    next()
  } catch (error) {
    const err = error
    if (err instanceof ZodError) {
      next(ApiError.badValidationRequest(err.errors))
      return
    }
    next(ApiError.internal('somthing went wrong'))
  }
}
export function validateOrder(req: Request, res: Response, next: NextFunction) {
  const schema = zod.object({
    firstName: zod.string()
    .min(7, { message: "Name must have at least 7 characters" })
    .max(20, { message: "Name can have at most 20 characters" }),
    userId: zod.string(),
    purchasedAt: zod.string(),
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
