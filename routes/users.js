const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')

// User Model
const User = require('../models/User')

// LOGIN AND REGISTER VIEW
router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', (req, res) => {
    res.render('register')
})

// LOGIN AND REGISTER POST
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
}))

router.post('/register', (req, res) => {
    const { username, password } = req.body

    let errors = [];

    // Check required fields
    if (!username || !password) {
        errors.push({ msg: 'Please fill in all fields' })
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            password
        })
    } else {
        User.findOne({ username: username })
            .then(async user => {
                if (user) {
                    errors.push({ msg: 'Username is already registered' })
                    res.render('register', {
                        errors,
                        username,
                        password
                    })
                } else {
                    const newUser = new User({
                        username,
                        password
                    });

                    //Hash password
                    const hash = await bcrypt.hash(password, 10)
                    newUser.password = hash
                    newUser.save()
                        .then(user => {
                            req.flash('sucess_msg', 'You are now registered')
                            res.redirect('/users/login')
                        })
                        .catch(err => console.log(err))
                }
            })
    }
})

module.exports = router