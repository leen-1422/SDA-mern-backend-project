import bcrypt from 'bcrypt'
import crypto from 'crypto'
import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import ApiError from '../errors/ApiError'
import { checkAuth } from '../middlewares/checkAuth'
import {
  validateForgotPaswwordUser,
  validateLoginUser,
  validateResetPasswordUser,
  validateUser,
} from '../middlewares/validations'
import User from '../models/user'

const router = express.Router()

//get list of users by admin

router.get('/', checkAuth('ADMIN'), async (req, res, next) => {
  const users = await User.find()
  res.json({
    users,
  })
})

//delete a user by an admin
router.delete('/:userId', checkAuth('ADMIN'), async (req, res, next) => {
  try {
    const { userId } = req.params
    const user = await User.findByIdAndDelete(userId)
    if (!user) {
      return next(ApiError.badRequest('The user is deleted.'))
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'error ' })
  }
})


//block user by an admin
router.put('/block/:userId', checkAuth('ADMIN'), async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        message: `Cannot find user with userId: ${userId}`,
      })
    }
    user.blocked = !user.blocked

    const updatedUser = await user.save()

    res.status(200).json({
      message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error with blocking/unblocking user', error)
    res.status(500).json({
      message: 'Internal server error',
    })
  }
})

//  Get user by ID
router.get('/:userId',checkAuth('ADMIN'), async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
})

//login test
// POST => login
router.post('/login', validateLoginUser, async (req, res, next) => {
  const { email, password } = req.validatedLoginUser
  const user = await User.findOne({ email })
  if (!user || !user.isActive) {
    next(ApiError.badRequest('invalid email or account not activated'))
    return
  }
  const isPassValid = await bcrypt.compare(password, user.password)
  if (!isPassValid) {
    next(ApiError.badRequest('invalid email or password'))
    return
  }
  const payload = {
    email: user.email,
    userId: user._id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  }

  const token = jwt.sign(payload, process.env.TOKEN_SECRET as string, {
    expiresIn: '24h',
  })

  const userWithoutPassword = await User.findOne({ email }).select({ password: 0 })

  res.status(200).json({
    msg: 'login successfull',
    token: token,
    user: userWithoutPassword,
    decodedUser: payload,
  })
})

// update user profile by user
router.put('/profile/:userId', checkAuth('USER'), async (req, res) => {
  try {
    const { firstName, lastName } = req.body
    const userId = req.params.userId

    const updatedUser = await User.findByIdAndUpdate(userId, { firstName, lastName }, { new: true })
    if (!updatedUser) {
      return res.status(404).json({
        message: `Cannot find user with userId: ${userId}`,
      })
    }
    res.status(200).json({
      message: 'User profile updated successfully',
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('Error with updating user profile', error)
    res.status(500).json({
      message: 'Internal server error',
    })
  }
})

// generate an avtivation token
function generateActivationToken() {
  return crypto.randomBytes(32).toString('hex')
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
})
async function sendActivationEmail(userEmail: string, activationToken: string) {
  const activationLink = `${process.env.MAILER_ACTIVATION_DOMAIN}/api/users/activateUser/${activationToken}`
  console.log('activationLink', activationLink)

  const mailOptions = {
    from: process.env.MAILER_USER,
    to: userEmail,
    subject: 'Account Activation',
    html: `<div style="background-color: #f2f2f2; padding: 20px;">
    <h2 style="color: #333;">Account Activation</h2>
    <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 20px;">Hello </p>
    <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 20px;">
      Click the button below to activate your account:
    </p>
    <a href="${activationLink}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 16px; font-size: 16px; border-radius: 4px;">Activate Account</a>
  </div>`,
  }
  const info = await transporter.sendMail(mailOptions)
  console.log('info', info)
}
// forgot password
export async function sendForgotPasswordEmail(userEmail: string, forgotPasswordCode: string) {
  const resetPasswordLink = `${process.env.MAILER_FORGOT_PASSWORD_DOMAIN}/reset-password/${forgotPasswordCode}`
  console.log('forgotPasswordCode', forgotPasswordCode)
  const mailOptions = {
    from: process.env.MAILER_USER,
    to: userEmail,
    subject: 'Forgot Password?',
    html: `<div style="background-color: #F2F2F2; padding: 20px;">
    <h2 style="color: #333;">Forgot Password</h2>
    <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 20px;">Hello </p>
    <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 20px;">
      Click the button below to reset your password:
    </p>
    <a href="${resetPasswordLink}" style="display: inline-block; background-color: #007BFF; color: #fff; text-decoration: none; padding: 10px 16px; font-size: 16px; border-radius: 4px;">Reset Password</a>
  </div>`,
  }
  const info = await transporter.sendMail(mailOptions)
  console.log('info', info)
}
//register an user
router.post('/register', validateUser, async (req, res, next) => {
  const { email, password, firstName, lastName } = req.validateUser
  const userExists = await User.findOne({ email })
  if (userExists) {
    return next(ApiError.badRequest('Email already registered'))
  }

  const activationToken = generateActivationToken()
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('hashedPassword', hashedPassword)

  const newUser = new User({
    email,
    firstName,
    lastName,
    password: hashedPassword,
    activationToken,
  })

  await newUser.save()

  await sendActivationEmail(email, activationToken)
  res.json({
    msg: 'User registered , Please Check your email to activate your account ',
    user: newUser,
  })
})
// resest the password
router.post('/reset-pass', validateResetPasswordUser, async (req, res) => {
  const password = req.resetPassUser.password // we will return it from object in index file, not from body
  const forgotPasswordCode = req.resetPassUser.forgotPasswordCode
  const hashedPassword = await bcrypt.hash(password, 10)
  // find by this
  const user = await User.findOne({ forgotPasswordCode })
  if (!user) {
    return res.json({ msg: 'Password did not reset' })
  }
  user.forgotPasswordCode = undefined
  user.password = hashedPassword
  await user.save()
  res.json({
    msg: 'Password is reset ',
  })
})
// forgot password
router.post('/forgot-password', validateForgotPaswwordUser, async (req, res, next) => {
  const { email } = req.forgotPassUser
  try {
    const userExists = await User.findOne({ email })
    if (!userExists || !userExists.isActive) {
      return next(
        ApiError.badRequest('Email does not exists or are you sure activated your email?')
      )
    }
    const forgotPasswordCode = generateActivationToken()
    await User.updateOne({ email }, { forgotPasswordCode })
    await sendForgotPasswordEmail(email, forgotPasswordCode)
    res.json({
      msg: ' Check your email to reset your password ',
    })
  } catch (error) {
    console.log('error:', error)
    next(ApiError.badRequest('somthing went wrong '))
  }
})
// we recive activation token as a params
router.get('/activateUser/:activationToken', async (req, res, next) => {
  const activationToken = req.params.activationToken
  const user = await User.findOne({ activationToken })
  if (!user) {
    next(ApiError.badRequest(' Invalid activation token '))
    return
  }
  //update the values
  user.isActive = true
  user.activationToken = undefined
  await user.save()
  res.status(200).json({
    msg: 'Account activated successfully',
  })
})
router.put('/role', checkAuth('ADMIN'), async (req, res) => {
  const userId = req.body.userId
  const role = req.body.role
  const user = await User.findOneAndUpdate({ _id: userId }, { role }, { new: true })
  res.json({
    user,
  })
})
export default router
