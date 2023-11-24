import express from 'express'
const router = express.Router()
import ApiError from '../errors/ApiError'
import Product from '../models/product'
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

//final
router.get('/', async (req, res) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const startIndex = (page - 1) * limit
  const lastIndex = page * limit
  const sortBy = req.query.sortBy
  const search = req.query.search
  const category = req.query.category
  // let searchQuery = {}
  let searchQuery: { name?: { $regex: RegExp }; price?: { $gte: number }; category?: string } = {}

  if (search) {
    searchQuery = { name: { $regex: new RegExp(String(req.query.name), 'i') } }
  }
  if (category && typeof category === 'string') {
    searchQuery.category = category
  }

  if (req.query.minPrice) {
    searchQuery.price = { $gte: Number(req.query.minPrice) }
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

  const result = { next: {}, previous: {}, result: [] as {} }
  const products = await Product.find(searchQuery)
    .sort(sortOption)
    .populate('category')
    .skip(startIndex)
    .limit(limit)
  const filteredCount = await Product.countDocuments(searchQuery)
  const totalPages = Math.ceil(filteredCount / limit)
  result.result = products
  if (lastIndex < totalPages) {
    result.next = {
      page: page + 1,
      limit: limit,
    }
  }
  if (startIndex + limit < filteredCount) {
    result.next = {
      page: page + 1,
      limit: limit,
    }
  }
  res.json(result)
})

// create a new product
router.post('/', async (req, res, next) => {
  const { name, description, image, price, sizes, quantity, category } = req.body

  console.log(category)
  if (!name || !description || !image || !price || !sizes || !category) {
    next(ApiError.badRequest('All fields are requried'))
    return
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
  console.log(product)
  await product.save()
  res.json(product)
})

// delete product
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params
  if (!ObjectId.isValid(id)) {
    next(ApiError.badRequest('bad request'))
    return
  }
  const product = await Product.findByIdAndDelete(id)
  if (!product) {
    next(ApiError.badRequest(`cannot find product with ${id}`))
    return
  }
  res.json(product)
})

// update product

router.put('/:id', async (req, res, next) => {
  const id = req.params.id
  if (!ObjectId.isValid(id)) {
    next(ApiError.badRequest('bad request'))
    return
  }
  const product = await Product.findByIdAndUpdate(id, req.body)
  if (!product) {
    next(ApiError.badRequest(`cannot find product with ${id}`))
    return
  }
  const updatedProduct = await Product.findById(id)
  res.json(updatedProduct)
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
