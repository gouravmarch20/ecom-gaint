const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })
const connectWithDb = require('./config/database')

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser') //? TODO:

// middleware
app.use(express.json())
app.use(cookieParser()) // acess cookie data p/f
app.use(bodyParser.urlencoded({ extended: true }))

// connecting to database
connectWithDb()

// routes
const errorMiddleware = require('./middleware/error')
const product = require('./routes/productRoute')
const user = require('./routes/userRoute')
const orderRoute = require('./routes/orderRoute')

app.use('/api/v1', errorMiddleware)
app.use('/api/v1', product)
app.use('/api/v1', user)
app.use('/api/v1', orderRoute)

module.exports = app
