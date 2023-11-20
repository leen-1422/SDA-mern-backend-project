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
    description: {
      type: String,
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
    },
    // categories:{
    //   type: [mongoose.Schema.Types.ObjectId],
    //   ref: 'Categories',
    //   required: true,
    // },

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
