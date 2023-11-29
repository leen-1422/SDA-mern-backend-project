import express from 'express'
import ApiError from '../errors/ApiError'
import { checkAuth } from '../middlewares/checkAuth'
import { validateCategory } from '../middlewares/validations'
import Category from '../models/category'

const router = express.Router()

// GET All Categories by an admin
router.get('/', checkAuth('ADMIN'), async (req, res) => {
  try {
    const categories = await Category.find()
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
})

// GET Category by ID
router.get('/:categoryId', checkAuth('ADMIN'), async (req, res) => {
  try {
    const categoryId = req.params.categoryId
    const category = await Category.findById(categoryId)
    res.status(200).json(category)
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
})

// CREATE a Category
router.post('/', validateCategory, checkAuth('ADMIN'), async (req, res, next) => {
  try {
    const name = req.body.name
    if (!name) {
      next(ApiError.badRequest('Name is required'))
      return
    }
    // Create a new category instance with the provided name
    const category = new Category({
      name,
    })

    await category.save()
    res.status(201).json({
      category,
    })
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
})

// UPDATE Category
router.put('/:categoryId', checkAuth('ADMIN'), async (req, res) => {
  const newName = req.body.name
  const categoryId = req.params.categoryId

  const newCategory = await Category.findByIdAndUpdate(
    categoryId,
    { name: newName },
    {
      new: true,
    }
  )

  res.json({
    category: newCategory,
  })
})

// DELETE Category by ID
router.delete('/:categoryId', checkAuth('ADMIN'), async (req, res) => {
  try {
    const categoryId = req.params.categoryId
    await Category.deleteOne({
      _id: categoryId,
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
})

export default router
