const ErrorHandler = require('../utils/errorhandler')
const catchAsyncError = require('../middleware/catchAsyncError')

const User = require('../models/userModel')

const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
// const cloudinary = require("cloudinary");

exports.signup = catchAsyncError(async (req, res, next) => {
  // ! TODO: image url cloudinary setup
  const { name, email, password } = req.body
  console.log(email, password)

  const user = await User.create({ name, email, password })

  sendToken(user, 201, res)
})
exports.signin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body
  console.log(email, password)

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler('Please Enter Email & Password', 400))
  }
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401))
  }
  const isPasswordMatched = await user.comparePassword(password)
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid email or password', 401))
  }

  sendToken(user, 200, res)
})

exports.signout = catchAsyncError(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    message: 'Logged Out'
  })
})
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  console.log(user)
  if (!user) {
    return next(new ErrorHandler('User not found', 404))
  }
  const resetToken = user.getResetPasswordToken()
  console.log(resetToken)
  await user.save({ validateBeforeSave: false })

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`
  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`
  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message
    })

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorHandler(error.message, 500))
  }
})
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // in url we had send unhased token , but in db -we had save it as hashed so ==> hashing it by crypto
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    // ! condition greater than current time
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    return next(
      new ErrorHandler(
        'Reset Password Token is invalid or has been expired',
        400
      )
    )
  }
  console.log(req.body.password)
  console.log(req.body.confirmPassword, 'confirmPassword')
  //password match password & confirmPassword
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not password', 400))
  }

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, 200, res)
})
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  console.log('getUserDetails', req.user.id)

  const user = await User.findById(req.user.id)
  console.log(user)
  // no error chance because login must
  res.status(200).json({
    success: true,
    user
  })
})
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  const user = await User.findById(req.user.id).select('+password')
  const isPasswordMatched = await user.comparePassword(oldPassword)
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Old password is incorrect', 400))
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler('password does not match - ', 400))
  }
  user.password = newPassword

  await user.save()

  sendToken(user, 200, res)
})

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body
  const newUserData = { name, email }
  // TODO: avatar
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })
  res.status(200).json({
    success: true
  })
})
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const user = await User.find()

  res.status(200).json({
    success: true,
    user
  })
})

exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    )
  }

  res.status(200).json({
    success: true,
    user
  })
})

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  console.log(req.body.name)
  const newUserData = {
    // name: req.body.name,
    // email: req.body.email,
    role: req.body.role
  }
  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })
  res.status(200).json({
    success: true
  })
})
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    )
  }
  //TODO: IMAGE REMOVE
  await user.remove()
  res.status(200).json({
    success: true,
    message: 'User Deleted Successfully'
  })
})
