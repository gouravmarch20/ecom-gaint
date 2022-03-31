const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const express = require('express')
const app = express()
const mongoose = require('mongoose')

const port = process.env.PORT
// Db connection
require('./db/connection')
//  Npm Middlewares
app.use(express.json())
const cookieParser = require('cookie-parser')
const cors = require('cors')
// My routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/order')

//My Routes
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api', productRoutes)
app.use('/api', orderRoutes)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
