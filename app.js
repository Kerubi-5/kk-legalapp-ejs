if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const passport = require('passport')
const session = require('express-session')
const flash = require('express-flash')
const User = require('./models/User')
const dbConnection = require('./config/db')

// Database
dbConnection()

const app = express()
const port = process.env.PORT || 3000

// Static Files
app.use(express.static('public'))
app.use('./css', express.static(__dirname + 'public/css'))

// Set templating engine
app.use(expressLayouts)
app.set('layout', './layouts/full-width')
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

// Passport
require('./config/passport')(passport)

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Flash
app.use(flash())

// Routes
const index = require('./routes/index')
const userRoutes = require('./routes/users')

app.use('/', index)
app.use('/users', userRoutes)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})