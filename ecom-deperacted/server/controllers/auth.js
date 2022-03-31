const User = require('../models/user')
const { check, validationResult } = require('express-validator')
var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')

exports.signup = (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    })
  }

  const user = new User(req.body)

  // TODO: EMAIL ALREADY
  User.findOne({ email: user.email })
    .then(savedUser => {
      if (savedUser) {
        return res
          .status(400)
          .json({ error: 'user already exists with that email' })
      }

      user.save((err, user) => {
        if (err) {
          return res.status(400).json({
            err: 'unable to save in database '
          })
        }
        res.json({
          name: user.name,
          email: user.email,
          id: user._id
        })
      })
    })
    .catch(err => {
      console.log(err)
    })
}

exports.signin = (req, res) => {
  const errors = validationResult(req)
  const { email, password } = req.body
  // console.log(email)
  // console.log(password)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    })
  }

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'USER email does not exists'
      })
    }

    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: 'Email and password do not match'
      })
    }

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY)
    //put token in cookie
    res.cookie('token', token, { expire: new Date() + 9999 })

    //send response to front end
    const { _id, name, email, role } = user
    return res.json({ token, user: { _id, name, email, role } })
  })
}

exports.signout = (req, res) => {
  res.clearCookie('token')
  res.json({
    message: 'User signout successfully'
  })
}

//express jwt : protected route , take token if very retun _id of login
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET_KEY,
  algorithms: ['HS256'],
  userProperty: 'auth' //! save user datab
})

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  // ! req.profile : from frontend
  let checker = req.profile && req.auth && req.profile._id == req.auth._id
  if (!checker) {
    return res.status(403).json({
      error: 'ACCESS DENIED'
    })
  }
  next()
}

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: 'You are not ADMIN, Access denied'
    })
  }
  next()
}
exports.test = (req, res, next) => {
  console.log('test')
  // console.log(req.auth)
  res.json({ sucess: 'hii' })
}
