const router = require('express').Router()

const User = require('../models/user.js')
const Recipe = require('../models/recipe.js')
const Ingredient = require('../models/ingredient.js')

//routes
router.get('/', async (req, res) => {
  const recipes = await Recipe.find().populate('owner')
  res.render('recipes/index.ejs', { recipes })
})

router.get('/', async (req, res) => {
  res.render('recipes/index.ejs')
})

router.post('/', async (req, res) => {
  try {
    const ingredientNames = req.body.ingredients
      .split(',')
      .map((name) => name.trim())
    const ingredientIds = await Promise.all(
      ingredientNames.map(async (name) => {
        const ingredient = await Ingredient.findOneAndUpdate(
          { name },
          { $setOnInsert: { name } },
          { upsert: true, new: true }
        )
        return ingredient._id
      })
    )

    const recipeData = {
      ...req.body,
      ingredients: ingredientIds,
      owner: req.session.user._id
    }
    await Recipe.create(recipeData)

    res.redirect('/recipes')
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
})

router.get('/new', async (req, res) => {
  const ingredient = await Ingredient.find()
  res.render('recipes/new.ejs', { ingredient })
})

router.get('/:recipeId', async (req, res) => {
  try {
    const populatedrecipes = await Recipe.findById(req.params.recipeId)
      .populate('owner')
      .populate('ingredients')

    res.render('recipes/show.ejs', {
      recipe: populatedrecipes
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.delete('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId)
    if (recipe.owner.equals(req.session.user._id)) {
      await recipe.deleteOne()
      return res.redirect('/recipes')
    }
    res.status(403).send("You don't have permission to do that.")
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
})

router.get('/:recipeId/edit', async (req, res) => {
  try {
    const currenRecipe = await Recipe.findById(req.params.recipeId)
    res.render('recipes/edit.ejs', {
      recipe: currenRecipe
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.put('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId)

    if (!recipe.owner.equals(req.session.user._id)) {
      return res.render("you don't own this")
    }

    if (req.body.ingredients) {
      const ingredientNames = req.body.ingredients
        .split(',')
        .map((name) => name.trim())

      const ingredientIds = await Promise.all(
        ingredientNames.map(async (name) => {
          const ingredient = await Ingredient.findOneAndUpdate(
            { name },
            { $setOnInsert: { name } },
            { upsert: true, new: true }
          )
          return ingredient._id
        })
      )

      req.body.ingredients = ingredientIds
    }

    await recipe.updateOne(req.body)
    res.redirect(`/recipes/${recipe._id}`)
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
})

module.exports = router
