import bcrypt from 'bcrypt'
import crypto from 'crypto'
import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import ApiError from '../errors/ApiError'
import { checkAuth } from '../middlewares/checkAuth'
import { validateLoginUser, validateUser } from '../middlewares/validations'
import User from '../models/user'

const router = express.Router()

//get list of users by admin
router.get('/', checkAuth('ADMIN'), async (req, res, next) => {
  const users = await User.find().populate('orderId')
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
      next(ApiError.badRequest('user id is required.'))
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'error ' })
  }
})
//update for an admin
router.put('/:id', checkAuth('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdAndUpdate(id, req.body)
    if (!user) {
      return res.status(404).json({
        message: `cannot find user with ${id}`,
      })
    }
    const updatedUser = await User.findById(id)
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({
      message: 'cannot find id',
    })
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
    user.blocked = true
    const blockedUser = await user.save()
    res.status(200).json({
      message: 'User blocked successfully',
      user: blockedUser,
    })
  } catch (error) {
    console.error('Error with blocking user', error)
    res.status(500).json({
      message: 'Internal server error',
    })
  }
})
//  Get user by ID
router.get('/:userId', async (req, res) => {
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

// POST => login
router.post('/login', validateLoginUser, async (req, res, next) => {
  const { email, password } = req.validatedLoginUser
  try {
    const user = await User.findOne({ email }).exec()

    if (!user) {
      return res.status(401).json({
        msg: 'Auth failed',
      })
    }
    // to compare hash password with the login passowrd
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(401).json({
          msg: 'Auth failed',
        })
      }
      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            role: user.role,
          },
          process.env.TOKEN_SECRET as string,
          {
            expiresIn: '24h',
          }
        )
        return res.status(200).json({
          msg: 'Auth successfull',
          token: token,
        })
      } else {
        return res.status(401).json({
          msg: 'Auth failed',
        })
      }
    })
  } catch (error) {
    console.log('Error in login', error)
    return res.status(500).json({
      message: 'Cannot find user',
    })
  }
})

// update user profile by user
router.put('/profile/:userId', checkAuth('USER'), async (req, res) => {
  try {
    const { firstName, lastName } = req.body
    const userId = req.params.userId
    if (!firstName || !lastName) {
      return res.status(400).json({
        message: 'Both firstName and lastName are required for the update',
      })
    }
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
    html: `<p>hello,</p> <p>Click <a href="${activationLink}">here</a>to activate your account</p>`,
  }
  const info = await transporter.sendMail(mailOptions)
  console.log('info', info)
}
//register an user
router.post('/register', validateUser, async (req, res, next) => {
  const { email, password, firstName, lastName ,orderId } = req.validateUser
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
    orderId

  })

  await newUser.save()

  await sendActivationEmail(email, activationToken)
  res.json({
    msg: 'User registered , Please Check your email to activate your account ',
    user: newUser,
  })
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
export default router
