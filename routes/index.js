const express = require('express')
const isAuth = require('./auth').isAuth
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index')
})

// PROTECTED ROUTES
router.get('/dashboard', isAuth, (req, res) => {
    res.render('dashboard')
})

module.exports = router