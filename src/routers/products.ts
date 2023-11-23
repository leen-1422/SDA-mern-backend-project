import express from 'express'
const router = express.Router()
import ApiError from '../errors/ApiError'
import Product from '../models/product'
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId
 
//final
router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let searchQuery: { name?: { $regex: RegExp }; price?: { $gte: number } } = {};

    if (req.query.name) {
      searchQuery.name = { $regex: new RegExp(String(req.query.name), 'i') };
    }
    if (req.query.minPrice) {
      searchQuery.price = { $gte: Number(req.query.minPrice) };
    }

    const result = { next: {}, previous: {}, result: [] as {} };

    const products = await Product.find(searchQuery)
      .populate('category')
      .skip(startIndex)
      .limit(limit);

    const totalProducts = await Product.countDocuments(searchQuery);
    result.result = products;

    if (startIndex + limit < totalProducts) {
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
      status: 'success',
      count: products.length,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      data: result,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
});




  
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
  const  id  = req.params.id
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
