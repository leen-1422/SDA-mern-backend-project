
import mongoose, { Document } from 'mongoose'

export type CategoryDocument = Document & {
  name: string
}

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // this is a unique index
    unique: true,
  },
})

export default mongoose.model<CategoryDocument>('Category', categorySchema)