import express from 'express';
import Category from '../models/category';
import ApiError from '../errors/ApiError';
import { validateCategory } from '../middlewares/validations';

const router = express.Router()

// GET All Categories
router.get('/', async (req, res) => {
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
router.get('/:categoryId', async (req, res) => {
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

// CREATE Category
router.post('/', validateCategory, async (req, res, next) => {
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
router.put('/:categoryId', async (req, res) => {
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
router.delete('/:categoryId', async (req, res) => {
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
