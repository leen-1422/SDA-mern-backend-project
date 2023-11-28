import express, { NextFunction } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import nodemailer from 'nodemailer'
import 'dotenv/config'

import ApiError from '../errors/ApiError'
import User from '../models/user'
import { validateLoginUser, validateUser } from '../middlewares/validations'
import { checkAuth } from '../middlewares/checkAuth'
import { parse } from 'dotenv'

const router = express.Router()

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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdAndUpdate(id, req.body)
    if (!user) {
      return res.status(404).json({
        message: `cannot find product with ${id}`,
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
async function sendActivationEmail(userEmail:string , activationToken:string){
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

router.post('/register', validateUser, async (req, res, next) => {
  const { email, password , firstName , lastName  } = req.validateUser
  const userExists = await User.findOne({ email })
  if (userExists) {
    return next(ApiError.badRequest('Email already registered'))
  }

  const activationToken = generateActivationToken()
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('hashedPassword', hashedPassword)

  const newUser = new User({
    email,
    firstName , 
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

// POST => login
router.post('/login', validateLoginUser, async (req, res, next) => {
  const { email , password } = req.validatedLoginUser
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
            userId : user._id,
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
        });
  }});
    } catch (error) {
      console.log('Error in login', error);
      return res.status(500).json({
        message: 'Cannot find user',
      });
    }
   
  });

// router.get('/:userId/page/:page', (req, res) => {
//   res.json({
//     msg: 'done',
//     // user: req.user,
//   })
// })


router.get('/', checkAuth('ADMIN'), async (req, res, next) => {
  const users = await User.find()
  res.json({
    users,
  })
})
export default router

