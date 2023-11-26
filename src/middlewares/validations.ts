import { parse } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import zod, { ZodError } from 'zod'
import ApiError from '../errors/ApiError'

export function ValidateUser(req: Request, res: Response, next: NextFunction) {
  const Schema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
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
