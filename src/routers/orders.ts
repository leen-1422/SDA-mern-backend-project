import express from 'express'
import Order from '../models/order'
import ApiError from '../errors/ApiError'
import mongoose from 'mongoose'
import { validateOrder } from '../middlewares/validations'
import OrderItems from '../models/orderItems'
import { checkAuth } from '../middlewares/checkAuth'

const router = express.Router()
// get all orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().populate('orderItems').populate('userId').sort('purchasedAt')
    res.json(orders)
  } catch (error) {
    console.error(error)
    next(ApiError.internal('Something went wrong.'))
  }
})
//create an order
router.post('/',checkAuth('USER'), async (req, res, next) => {
  try {
    const orderItemsId = Promise.all(
      req.body.orderItems.map(async (orderItem: { quantity: number; product: {} }) => {
        let newOrderItem = new OrderItems({
          quantity: orderItem.quantity,
          product: orderItem.product,
        })
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
      })
    )

    const orderIds = await orderItemsId
    const totalPrices = await Promise.all(
      orderIds.map(async (orderItemId) => {
        const orderItem = await OrderItems.findById(orderItemId).populate('product', 'price')
        if (orderItem && orderItem.product) {
          // @ts-ignore
          const totalPrice = orderItem.product.price * orderItem.quantity
          return totalPrice
        }
        return 0
      })
    )
    console.log(totalPrices)
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    console.log(orderIds, 'error is here')
    const { firstName, userId, purchasedAt, status, total } = req.body

    const order = new Order({
      firstName,
      userId,
      purchasedAt,
      orderItems: orderIds,
      status,
      total: totalPrice,
    })

    await order.save()

    res.json(order)
  } catch (error) {
    console.error(error)
    next(ApiError.internal('Something went wrong.'))
  }
})
//update order
router.put('/:id',checkAuth('ADMIN'), async (req, res) => {
  const id = req.params.id
  const order = await Order.findByIdAndUpdate(id, { status: req.body.status })

  if (!order) return res.status(400).send('cannot be created')
  res.send(order)
})
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    Order.findByIdAndDelete(id).then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItems.findByIdAndDelete(orderItem)
        })
        return res.status(200).json({ success: true, message: 'the order is deleted!' })
      } else {
        return res.status(404).json({ success: false, message: 'order not found!' })
      }
    })
  } catch (error) {
    console.error(error)
    next(ApiError.internal('Something went wrong.'))
  }
})

export default router
