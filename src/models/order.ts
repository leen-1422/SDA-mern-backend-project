import mongoose, { Document } from 'mongoose'

export type OrderDocument = Document & {
  name: string
  orderItems: mongoose.Schema.Types.ObjectId[]
}

const orderSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
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
  status: {
    type: String,
    default: 'pending',
  },
  total: {
    type: Number,
  },
})

export default mongoose.model<OrderDocument>('Order', orderSchema)
