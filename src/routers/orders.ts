import express from 'express'
import Order from '../models/order'
import ApiError from '../errors/ApiError'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/', async (req, res) => {
  const orders = await Order.find().populate('products.product').populate('userId')

  res.json(orders)
})

router.post('/', async (req, res, next) => {
  try {
    const { userId, purchasedAt, products } = req.body

    if ( !products || !userId || !purchasedAt) {
      throw ApiError.badRequest('All fields are required')
    }

    // Ensure that products array contains valid ObjectId values
    const validProductIds = products.map((product: { product: any }) => product.product);
    const areValidProductIds = validProductIds.every(mongoose.Types.ObjectId.isValid);

    if (!areValidProductIds) {
      throw ApiError.badRequest('Invalid product ObjectId in the products array');
    }

    const order = new Order({
      userId,
      purchasedAt,
      products,
    })

    console.log('orderId:', order._id)

    await order.save()

    res.json(order)
  } catch (error) {
    next(error)
  }
})


export default router
