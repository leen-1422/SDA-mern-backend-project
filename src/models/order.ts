import mongoose, { Document } from 'mongoose'

export type OrderDocument = Document & {
  name: string
  products: mongoose.Schema.Types.ObjectId[]
}

const orderSchema = new mongoose.Schema({
  productId: {
    type: Number,
    default: 1,
    required: true,
  },
  userId:{
    type: Number,
    default: 1,
    required: true,
  },
  purchasedAt:{
    type: String,
    required: true ,
  },
  firstName:{
    type: String,
    required: true
  },
products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
  },
})

export default mongoose.model<OrderDocument>('Order', orderSchema)
