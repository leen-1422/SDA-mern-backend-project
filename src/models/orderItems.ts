import mongoose, { Document } from 'mongoose'

// export type OrderItemsDocument = Document & {
//   name: string
//   products: mongoose.Schema.Types.ObjectId
// }

const orderItemsSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    default: 1,
  },
})

export default mongoose.model('OrderItems', orderItemsSchema)
