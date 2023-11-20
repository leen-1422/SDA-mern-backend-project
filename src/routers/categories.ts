import express from 'express'

import Category from '../models/category'
import ApiError from '../errors/ApiError'
const router = express.Router()

router.get('/', async (req, res) => {
  const categories = await Category.find()

  res.status(200).json(categories)
})

router.get('/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId
  const category = await Category.findById(categoryId)

  res.status(200).json(category)
})

router.post('/', async (req, res, next) => {
  const name = req.body.name

  if (!name) {
    next(ApiError.badRequest('Name is requried'))
    return
  }

  const category = new Category({
    name,
  })

  await category.save()

  res.status(201).json({
    category,
  })
})

router.put('/:categoryId', async (req, res) => {
  const newName = req.body.name
  const categoryId = req.params.categoryId

  const newCat = await Category.findByIdAndUpdate(
    categoryId,
    { name: newName },
    {
      new: true,
    }
  )

  res.json({
    category: newCat,
  })
})

// ONLY DO THIS ENDPOINT IF YOU REALLY WANT TO DELETE THE DATA
// router.delete('/', async (req, res) => {
//   await Category.deleteMany()

//   res.status(204).send()
// })

router.delete('/:categoryId', async (req, res) => {
  const { categoryId } = req.params

  await Category.deleteOne({
    _id: categoryId,
  })

  res.status(204).send()
})

export default router