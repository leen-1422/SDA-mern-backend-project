import { Request, Response, NextFunction } from 'express'
import { Product } from '../models/productSchema'

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find()
    res.send({ message: 'get all products!', payload: products })
  } catch (error) {
    next(error)
  }
}
