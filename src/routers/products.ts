import express from 'express'
import mongoose from 'mongoose'
import ApiError from '../errors/ApiError'
import { checkAuth } from '../middlewares/checkAuth'
import upload from '../middlewares/uploadFile'
import { validateProducts } from '../middlewares/validations'
import Product from '../models/product'
const router = express.Router()
const ObjectId = mongoose.Types.ObjectId

//get list of products

router.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 4
  const startIndex = (page - 1) * limit
  const lastIndex = page * limit
  const search = req.query.search
  const category = req.query.category
  const sortBy = req.query.sortBy
  // let searchQuery = {}
  let searchQuery: { name?: { $regex: RegExp }; price?: { $gte: number }; category?: string } = {}

  if (search) {
    searchQuery = { name: { $regex: new RegExp(String(req.query.name), 'i') } }
  }
  if (req.query.minPrice) {
    searchQuery.price = { $gte: Number(req.query.minPrice) }
  }
  if (category && typeof category === 'string') {
    searchQuery.category = category
  }

  let sortOption = {}
  if (sortBy) {
    if (sortBy === 'price') {
      const price = Number(req.query.price)
      if (price === 1) {
        sortOption = { price: 1 } // Ascending order
      } else if (price === -1) {
        sortOption = { price: -1 } // Descending order
      }
    } else if (sortBy === 'name') {
      const name = Number(req.query.name)
      if (name === 1) {
        sortOption = { name: 1 } // Ascending order by name
      } else if (name === -1) {
        sortOption = { name: -1 } // Descending order by name
      }
    }
  }

  const result = { infoOfPage: {}, next: {}, previous: {}, result: [] as {} }
  const products = await Product.find(searchQuery)
    .sort(sortOption)
    .populate('category')
    .skip(startIndex)
    .limit(limit)
  const filteredCount = await Product.countDocuments(searchQuery)
  const totalPages = Math.ceil(filteredCount / limit)
  result.result = products

  result.infoOfPage = {
    page: page,
    perPage: limit,
    totalPages: totalPages,
    totalItems: filteredCount,
  }

  if (lastIndex < totalPages) {
    result.next = {
      page: page + 1,
      limit: limit,
    }
  }

  res.json(result)
})

//get list of products by admin

router.get('/admin',  async (req, res, next) => {
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
