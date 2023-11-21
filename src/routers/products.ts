import express from 'express'
const router = express.Router()

import ApiError from '../errors/ApiError'
import Product from '../models/product'

import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId

// fetech all products
router.get('/', async (_, res) => {
  const products = await Product.find()
  console.log('products:', products)
  res.json(products)
})

// create a new product
router.post('/', async (req, res, next) => {
  const { name, description, image, sizes, price } = req.body
  if (!name || !description || !image || !sizes || !price) {
    next(ApiError.badRequest('all fileds are required'))
    return
  }
  const product = new Product({
    name,
    image,
    description,
    // categories,
    sizes,
    price,
  })
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
  const { id } = req.params
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
