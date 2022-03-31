const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorhandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apifeatures')

exports.createProduct = catchAsyncError(async (req, res, next) => {
  let images = []
  // image case TODO:
  const imagesLinks = []
  //TODO: MORE CASE
  const product = await Product.create(req.body)
  res.status(201).json({
    success: true,
    product
  })
})
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find()
  res.status(201).json({
    success: true,
    products
  })
})
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});
exports.updateProduct = catchAsyncError(async (req, res, next) => {})

exports.deleteProduct = catchAsyncError(async (req, res, next) => {})

exports.createUpdateProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  }
  const product = await Product.findById(productId)
  const isReviewed = product.reviews.find(
    //   user mai _id store of the model it ref
    review => review.user.toString() === req.user._id.toString()
  )
  //   update reviw
  if (isReviewed) {
    product.reviews.forEach(review => {
      // TODO: WHY BLOCK ISSUE ==> may due to for each blocked
      if (review.user.toString() === req.user._id.toString())
        (review.rating = rating), (review.comment = comment)
    })
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }

  let avg = 0
  //   total review sum
  product.reviews.forEach(review => {
    avg += review.rating
  })
  //    !TODO : AS FLOOR , 1 DIGIT ACCEPT review average
  product.ratings = avg / product.reviews.length
  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true
  })
})

exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId)
  if (!product) {
    return next(new ErrorHandler('Product not found', 404))
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews
  })
})
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId)
  if (!product) {
    return next(new ErrorHandler('Product not found', 404))
  }
  // removing the review as per id
  const reviews = product.reviews.filter(
    review => review._id.toString() !== req.query.reviewsId.toString()
  )
  //! if review empty : stop code
  //rating
  let avg = 0
  reviews.forEach(review => {
    avg += review.rating
  })
  const ratings = avg / product.reviews.length
  const numOfReviews = reviews.length
  //   console.log(reviews)

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false
    }
  )

  res.status(200).json({
    success: true
  })
})
