const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.render('index')
})

// LOGIN AND REGISTER VIEW
router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

// LOGIN AND REGISTER POST
router.post('/login', (req, res) => {
})

router.post('/register', (req, res) => {
})

module.exports = router