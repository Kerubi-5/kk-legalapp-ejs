const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
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
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

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

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {
                                    req.flash(
                                        'sucess_msg',
                                        'You are now registered and can log in'
                                    );
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            })
    }
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('sucess_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router