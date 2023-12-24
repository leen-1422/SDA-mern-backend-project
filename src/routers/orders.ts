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
    const orders = await Order.find().populate({ path: 'orderItems', populate: { path: 'product' }  }).populate('userId').sort('purchasedAt')
    res.json(orders)
  } catch (error) {
    console.error(error)
    next(ApiError.internal('Something went wrong.'))
  }
})
//create an order
router.post('/', validateOrder, checkAuth('USER') , async (req, res, next) => {
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

   
    const { userId, purchasedAt, status, total, shippingAddress, city, zipCode, country, phone } =
      req.body

    const order = new Order({
      userId,
      purchasedAt,
      orderItems: orderIds,
      status,
      total: totalPrice,
      shippingAddress,
      city,
      zipCode,
      country,
      phone,
    })

    await order.save()
    res.json(order)
  } catch (error) {
    console.error(error)
    next(ApiError.internal('Something went wrong.'))
  }
})
// Update Order
router.put('/:orderId', checkAuth('ADMIN'),   async (req, res) => {
  const newStatus = req.body.status;
  const orderId = req.params.orderId;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }
    );
    if (!updatedOrder) {
      console.error(`Order with ID ${orderId} not found`);
      return res.status(404).json({ success: false, message: `Order with ID ${orderId} not found` });
    }
    console.log('Order updated successfully:', updatedOrder);
    res.json({ success: true, message: 'Order updated successfully', updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


router.delete('/:id', checkAuth('ADMIN'),  async (req, res, next) => {
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
router.get('/:orderId', checkAuth('ADMIN'), async (req, res) => {
  try {
    const orderId = req.params.orderId
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
})

export default router
