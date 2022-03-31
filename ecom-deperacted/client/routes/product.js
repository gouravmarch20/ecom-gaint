const express = require('express')
const router = express.Router()

const {
  getProductById,
  createProduct,
  getProduct,
  photo,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllUniqueCategories
} = require('../controllers/product')
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth')
const { getUserById } = require('../controllers/user')

//all of params
router.param('userId', getUserById)
router.param('productId', getProductById)

//create route
router.post(
  '/product/create/:userId',
  isSignedIn,
  isAuthenticated,
  isAdmin, 
  createProduct
)

// read routes --> with perfomance optimize -->  data send first , img take time to send front &  load at front
router.get('/product/:productId', getProduct) // only product data
router.get('/product/photo/:productId', photo) // only image

//delete route
router.delete(
  '/product/:productId/:userId',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
)

//update route
router.put(
  '/product/:productId/:userId',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
)

//listing route
router.get('/products', getAllProducts)

router.get('/products/categories', getAllUniqueCategories)

module.exports = router
