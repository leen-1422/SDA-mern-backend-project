import mongoose, { Document } from 'mongoose'
import { string } from 'zod'

export type OrderDocument = Document & {
  name: string
  orderItems: mongoose.Schema.Types.ObjectId[]
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },

  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItems',
    },
  ],
  shippingAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: 'pending',
  },
  total: {
    type: Number,
  },
})

export default mongoose.model<OrderDocument>('Order', orderSchema)
