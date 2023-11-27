import express from 'express'
import Order from '../models/order'
import ApiError from '../errors/ApiError'
import mongoose from 'mongoose'
import { validateOrder } from '../middlewares/validations'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().populate('products.product').populate('userId')
    res.json(orders)
  } catch (error) {
    console.error(error)
    next(ApiError.internal('Something went wrong. Please check the server logs.'))
  }
})

router.post('/', validateOrder, async (req, res, next) => {
  try {
    const { firstName, userId, purchasedAt, products } = req.body

    if (!products || !userId || !purchasedAt || !firstName) {
      throw ApiError.badRequest('All fields are required')
    }

    // Ensure that products array contains valid ObjectId values
    const validProductIds = products.map((product: { product: any }) => product.product)
    const areValidProductIds = validProductIds.every(mongoose.Types.ObjectId.isValid)

    if (!areValidProductIds) {
      throw ApiError.badRequest('Invalid product ObjectId in the products array')
    }

    const order = new Order({
      firstName,
      userId,
      purchasedAt,
      products,
    })

    console.log('orderId:', order._id)

    await order.save()

    res.json(order)
  } catch (error) {
    console.error(error)
    next(ApiError.internal('Something went wrong.'))
  }
})

export default router
