const express = require('express')
const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
const router = express.Router()

// auth routes
router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/signout').get(signout)
router.route('/password/forgot').post(forgotPassword) //token & url  send to email  15 m valid
router.route('/password/reset/:token').put(resetPassword) // if user click on that link
router.route('/password/update').get(isAuthenticatedUser, updatePassword)
// user routes
router.route('/me').get(isAuthenticatedUser, getUserDetails)
router.route('/me/update').put(isAuthenticatedUser, updateProfile)
router
  .route('/admin/users')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUser)

router
  .route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)
module.exports = router
