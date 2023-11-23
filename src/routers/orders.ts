import express from 'express'
const router = express.Router()

import Order from '../models/order'
import User from '../models/user'
import ApiError from '../errors/ApiError'

router.get('/', async (req, res) => {
  const orders = await Order.find().populate('products')
  res.json(orders)
})

router.post('/', async (req, res, next) => {
  const { productId, userId, purchasedAt, firstName, products } = req.body

  if (!firstName || !products || !userId) {
    
    next(ApiError.badRequest('all fieldes are required'))
    return
  }
  const order = new Order({
    productId,
    userId,
    purchasedAt,
    firstName,
    products,
  })
  console.log('orderId:', order._id)
  

  await order.save()
  res.json(order)
})



export default router
