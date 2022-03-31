const express = require('express')
const router = express.Router()

const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController')

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
router.route('/order/new').post(isAuthenticatedUser, newOrder)
router.route('/orders/me').get(isAuthenticatedUser, myOrders)

router.route('/order/:orderId').get(isAuthenticatedUser, getSingleOrder)
router
  .route('/admin/orders')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders)
router
  .route('/admin/order/:orderId')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder)
module.exports = router
