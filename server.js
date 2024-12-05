const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const session = require('express-session')
const passUsertoView = require('./middleware/pass-user-to-view')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')

// port config
const PORT = process.env.PORT ? process.env.PORT : '3000'

//data connecion
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`connected to mongoDB: ${mongoose.connection.name}`)
})
//middlewares
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passUsertoView)
//Require Controllers
const authCtrl = require('./controllers/auth')
const isSignedIn = require('./middleware/is-signed-in')
const recipesController = require('./controllers/recipes.js')
const ingredientsController = require('./controllers/ingredients.js')
//use controller
// app.use(isSignedIn)
app.use('/auth', authCtrl)
app.use('/recipes', recipesController)
app.use('/ingredients', ingredientsController)
//root route
app.get('/', async (req, res) => {
  res.render('index.ejs')
})

//listen for the http
app.listen(PORT, () => {
  console.log('auth app  listening')
})
