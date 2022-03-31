const ErrorHandler = require('../utils/errorhandler')
const catchAsyncError = require('./catchAsyncError')

const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        return next(new ErrorHandler('Please Login to access this resource', 401))
    }
    // jwt verify return user _id : as per given conditon
    const currentUser = await jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(currentUser.id)

    next()
})
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to access this resouce `,
                    403
                )
            )
        }
        next()
    }
}
