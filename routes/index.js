const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const passport = require('passport')

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
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

router.post('/register', async (req, res) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10)
        User.push({
            username: req.body.username,
            password: hash
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(User)
})

module.exports = router