if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const router = require('./routes/index')

const app = express()
const port = process.env.PORT || 3000

// Static Files
app.use(express.static('public'))
app.use('./css', express.static(__dirname + 'public/css'))

// Set templating engine
app.use(expressLayouts)
app.set('layout', './layouts/full-width')
app.set('view engine', 'ejs')

// Routes
app.use('/', router)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})