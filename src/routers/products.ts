import express from 'express'
import mongoose from 'mongoose'
import ApiError from '../errors/ApiError'
import { checkAuth } from '../middlewares/checkAuth'
import upload from '../middlewares/uploadFile'
import { validateProducts } from '../middlewares/validations'
import Product from '../models/product'
const router = express.Router()
const ObjectId = mongoose.Types.ObjectId

export type SortOrder = 1 | -1
type Filter = {
  category?: string
  name?: { $regex: RegExp }
}

//get list of products by user
router.get('/', async (req, res) => {
  const filters: Filter = {}
  const pageNumber: number = Number(req.query.pageNumber) || 1
  const perPage: number = Number(req.query.perPage) || 4
  const categoryId: string = req.query.categoryId as string
  const sortField: string = (req.query.sortField as string) || 'price'
  const sortOrder: SortOrder = req.query.sortOrder === 'high to low' ? -1 : 1
  const sortOptions: { [key: string]: SortOrder } = { [sortField]: sortOrder }

  const search: string = (req.query.search as string) || ''
  const name = req.query.name

  if (categoryId && typeof categoryId === 'string') {
    //@ts-ignore
    filters.category = { $in: categoryId }
  }

  if (search && typeof search === 'string') {
    filters.name = { $regex: new RegExp(search, 'i') }
  }
  try {
    const products = await Product.find(filters)
      .sort(sortOptions)
      .skip((pageNumber - 1) * perPage)
      .limit(perPage)
      .populate('category')
    const totalProducts = await Product.countDocuments(filters)
    const totalPages = Math.ceil(totalProducts / perPage)
    res.json({
      pageNumber,
      perPage,
      totalProducts,
      totalPages,
      products,
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

//get list of products by admin

router.get('/admin', checkAuth('ADMIN'), async (req, res, next) => {
  const products = await Product.find().populate('category')
  res.json({
    products,
  })
})

// create a new product
router.post('/', validateProducts, checkAuth('ADMIN'), async (req, res, next) => {
  try {
    const { name, description, image, price, sizes, quantity, category } = req.body

    if (!name || !description || !image || !price || !sizes || !category) {
      throw ApiError.badRequest('All fields are required')
    }
    const product = new Product({
      name,
      description,
      quantity,
      category,
      sizes,
      price,
      image,
    })
    await product.save()
    res.json({ success: true, message: 'Product created', data: product })
  } catch (error) {
    next(error)
  }
})

// Update Product
router.put('/:productId', checkAuth('ADMIN'), async (req, res) => {
  const productId = req.params.productId
  // const newName = req.body.name
  const { name, description, image, price, sizes, quantity, category } = req.body

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { name, description, image, price, sizes, quantity, category },
      { new: true }
    )

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: `Product with ID ${productId} not found` })
    }
    if (updatedProduct) {
      res.json({ success: true, message: 'Product updated successfully', updatedProduct })
    }
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})
// delete product
router.delete('/:productId', checkAuth('ADMIN'), async (req, res, next) => {
  try {
    const { productId } = req.params
    const product = await Product.findByIdAndDelete(productId)
    if (!product) {
      next(ApiError.badRequest('Product is deleted successfully.'))
    }
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: 'error ' })
  }
})

// get a single product by id

router.get('/:id', async (req, res, next) => {
  const { id } = req.params

  // Validate if id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    next(ApiError.badRequest('bad request'))
    return
  }

  const product = await Product.findById(id)
  console.log('product:', product)
  if (!product) {
    next(ApiError.badRequest(`cannot find product with ${id}`))
    return
  }

  res.json(product)
})

export default router
