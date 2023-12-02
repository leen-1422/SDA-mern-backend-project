// import { Request, Response, NextFunction } from 'express'
// import Product from '../models/product'
// import ApiError from '../errors/ApiError'

// export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const products = await Product.find()
//     res.send({ message: 'get all products!', payload: products })
//   } catch (error) {
//     next(error)
//   }
// }
// export const createProducts = async (req: Request, res: Response, next: NextFunction) => {
//   const { name, description, price } = req.body

//   console.log('Received Request Body:', req.body)

//   if (!name.trim() || !description.trim()) {
//     console.error('Title or description is missing or empty in the request body')
//     next(ApiError.badRequest('Name and Description are required'))
//     return
//   }

//   try {
//     const product = new Product({
//       name,
//       description,
//       price,
//     })

//     await product.save()
//     console.log('Product created successfully:', product)
//     res.status(201).json({ message: 'Product created successfully', product })
//   } catch (error) {
//     console.error('Error creating product:', error)
//     next(error)
//   }
// }
