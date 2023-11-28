import mongoose from 'mongoose'
import { boolean } from 'zod'
function validateRole(role: string) {
  if (role === 'USER' || role === 'ADMIN') {
    return true
  }
  return false
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive:{
    type: Boolean,
    default: false
  },
  activationToken :{
    type:String

  },
  role: {
    type: String,
    default: 'USER',
    validate: [validateRole, 'Role has to be either USER or ADMIN'],
  },

  // relation between order and user should be many orders to one user
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
})

export default mongoose.model('Client', userSchema)
