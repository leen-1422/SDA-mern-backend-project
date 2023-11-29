import mongoose from 'mongoose'
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
  blocked: {
    type: Boolean,
    default: false,
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
  isActive: {
    type: Boolean,
    default: false,
  },
  activationToken: {
    type: String,
  },
  role: {
    type: String,
    default: 'USER',
    validate: [validateRole, 'Role has to be either USER or ADMIN'],
  },

  // orderId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Order',
  //   required: true,
  // },
})

export default mongoose.model('Client', userSchema)
