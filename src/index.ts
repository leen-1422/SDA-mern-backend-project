import express, { Application } from 'express'
import morgan from 'morgan'
import createHttpError from 'http-errors'
import { errorHandler } from './middlewares/errorHandler'
import { dev } from './config'
import productRouter from './routers/products'
import { connect } from 'http2'
import { connectDB } from './config/db'

const app: Application = express()
const port: Number = dev.app.port

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`)
  connectDB()
})

app.get('/', (req, res) => {
  res.json({ message: 'hello world' })
})

app.use(morgan('dev'))
// if you want to recive data from body request
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//products API
app.use('/products', productRouter)
//to create the error
app.use((req, res, next) => {
  next(createHttpError(404, 'Not Found'))
})
// use this error handler for all endpoints
app.use(errorHandler);
