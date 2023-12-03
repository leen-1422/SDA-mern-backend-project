import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import myLogger from './middlewares/logger'
import apiErrorHandler from './middlewares/errorHandler'


dotenv.config();

const app = express()
const PORT = process.env.PORT || 5050
const URL = process.env.ATLAS_URL as string


// Middleware
app.use(myLogger)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors()) // Enable CORS

// Routes
import usersRouter from './routers/users'
import productsRouter from './routers/products'
import ordersRouter from './routers/orders'
import categoryRouter from './routers/categories'

app.use('/api/users', usersRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/products', productsRouter)
app.use('/api/categories', categoryRouter)

// Error handling middleware
app.use(apiErrorHandler)

// Connect to MongoDB
mongoose
  .connect(URL)
  .then(() => {
    console.log('Database connected')
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

export default app;