import express from 'express'
const router = express.Router()

import Product from '../models/productSchema'
import Order from '../models/order'
import ApiError from '../errors/ApiError'



router.get('/', async (_, res) => {
  const products = await Product.find()
  console.log('products:', products)
  res.json(products)
})

router.post('/', async (req, res, next) => {
  const { name, description, image, categories, sizes, price } = req.body

  if (!name || !description) {
    next(ApiError.badRequest('Name and Description are requried'))
    return
  }
  const product = new Product({
    name,
    image,
    description,
    categories,
    sizes,
    price

    
  })

  await product.save()
  res.json(product)
})

export default router