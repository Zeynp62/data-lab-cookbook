//invoking router functionality with express
const router = require('express').Router()
const bcrypt = require('bcrypt')
//because user is related to model db its capital
const User = require('../models/user')
//routes/API's/ Controller Functions
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})
router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
      return res.send('Username already taken')
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.send('password and confirm password must match ')
    }
    //bcrypt for password encryption
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword
    const user = await User.create(req.body)
    res.send(`THANKS FOR SIGNING UP ${user.username}`)
  } catch (error) {
    console.log(error)
  }
})
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})
router.post('/sign-in', async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username })
  if (!userInDatabase) {
    return res.send('Login failed try again')
  }
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  )
  if (!validPassword) {
    return res.send('Login failed try again')
  }

  //user exists and password is valid
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id
  }
  res.redirect('/')
})
router.get('/sign-out', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
//always the last line
module.exports = router
