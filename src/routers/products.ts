import express from 'express'
const router = express.Router()

import ApiError from '../errors/ApiError'
import Product from '../models/product'

import mongoose from 'mongoose'
import product from '../models/product'
const ObjectId = mongoose.Types.ObjectId
 

//final 
router.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const lastIndex = page * limit;


  let searchQuery = {};
  if (req.query.name) {
    searchQuery = { name: { $regex: new RegExp(String(req.query.name), 'i') } };
  }

  const result = { next: {}, previous: {}, result: [] as {} }
  const products = await Product.find(searchQuery).skip(startIndex).limit(limit);
  const totalPages = await Product.countDocuments(searchQuery);

  result.result = products;

  if (lastIndex < totalPages) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  res.json({
    status: "success",
    count: products.length,
    page,
    totalPages,
    data: result,
  });
});


  

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
