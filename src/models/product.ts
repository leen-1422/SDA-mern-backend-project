import mongoose from 'mongoose'
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    description: {
      type: String,
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)
export default mongoose.model('Product', productSchema)









