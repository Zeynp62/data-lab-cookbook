const router = require('express').Router()

const User = require('../models/user.js')
const Recipe = require('../models/recipe.js')
const Ingredient = require('../models/ingredient.js')

//routes
router.get('/', async (req, res) => {
  res.render('recipes/index.ejs')
})
router.post('/', async (req, res) => {
  req.body.owner = req.session.user._id
  await Recipe.create(req.body)
  res.redirect('/recipes')
})
router.get('/new', async (req, res) => {
  const ingredient = await Ingredient.find()
  res.render('recipes/new.ejs', { ingredient })
})
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body)
    newRecipe.owner = req.session.user._id
    await newRecipe.save()
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
})
module.exports = router
