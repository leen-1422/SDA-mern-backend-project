import { Schema, model } from 'mongoose'

const productSchema = new Schema({
  title: {
    type: String,
    index: true,
    required: true,
    trim: true,
    minlength: [3, 'product title must be at least 3 characters long'],
    maxlength: [300, 'product title must be at most 300 characters long'],
  },
  //make the id more readable
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'product description must be at least 3 characters long'],
  },
  shipping: {
    type: Number,
    default: 0,
  },
})
// create the model / collections
export const Product = model('Products', productSchema)
