const express = require('express')
const router = express.Router()
const isAuth = require('./auth').isAuth

router.get('/', (req, res) => {
    res.render('index')
})

// PROTECTED ROUTES
router.get('/dashboard', isAuth, (req, res) => {
    res.render('dashboard')
})

module.exports = router