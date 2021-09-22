const express = require('express');
const router = express.Router();
const authUtils = require('../utils/crypto')
const passport = require('passport');
// Load User model
const User = require('../models/User');
const forwardAuthenticated = require('./auth').isNotAuth



// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
    const {
        username,
        email,
        password,
        password2,
        user_fname,
        user_lname,
        birthdate,
        contact_number,
        permanent_address,
        city,
        zip,
        user_type,
        affiliation } = req.body;

    let errors = [];

    if (!username || !email || !password || !password2 || !user_fname || !user_lname || !birthdate || !contact_number || !permanent_address || !city || !zip) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            email,
            password,
            password2,
            user_fname,
            user_lname,
            birthdate,
            contact_number,
            permanent_address,
            city,
            zip,
            user_type
        });
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    username,
                    email,
                    password,
                    password2,
                    user_fname,
                    user_lname,
                    birthdate,
                    contact_number,
                    permanent_address,
                    city,
                    zip,
                    user_type
                });
            } else {
                const newUser = new User({
                    username,
                    email,
                    password,
                    user_fname,
                    user_lname,
                    birthdate,
                    contact_number,
                    permanent_address,
                    city,
                    zip,
                    user_type
                });

                newUser.password = authUtils.hashPassword(password);
                newUser.save()
                req.flash('sucess_msg', 'You are now registered please log in to continue')
                res.redirect('/users/login')
            }
        });
    }
});

// Login
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })
);

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('sucess_msg', 'You are logged out');
    res.redirect('/users/login');

});

// Protected Routes
router.get('./dashboard',)

module.exports = router;