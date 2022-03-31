const mongoose = require('mongoose')

const DB = process.env.DATABASE

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(con => {
    console.log('----> CONNECTED TO DB SUCESSFULLY')
  })
  .catch(err => {
    console.log('the error is ' + err)
  })
