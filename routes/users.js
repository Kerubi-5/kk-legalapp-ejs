const express = require('express');
const router = express.Router();
const authUtils = require('../utils/crypto')
const passport = require('passport');
// Load User model
const User = require('../models/User');
const forwardAuthenticated = require('./auth').isNotAuth;
const { isClient } = require('./auth');



// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register POST
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

    if (!username || !email || !password || !password2 || !user_fname || !user_lname || !birthdate || !contact_number || !permanent_address || !city || !zip) errors.push({ msg: 'Please enter all fields' });

    if (username.length > 20) errors.push({ msg: 'Username cannot be longer than 20 characters' })

    if (password != password2) errors.push({ msg: 'Passwords do not match' });

    if (password.length < 6 || password.length > 20) errors.push({ msg: 'Password must be at least 6 characters, and not more than 20 characters long' });

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

// Public Profile View
router.get('/:objectId', isClient, (req, res) => {
    const objectId = req.params.objectId
    const id = req.session.passport.user
    User.findOne({ _id: id }, (err, result) => {
        if (err) throw err

        res.render('public-profile', { result, id: id })
    })
})

// Profile Edit View
router.get('/edit/:id', isClient, (req, res) => {
    const id = req.session.passport.user
    const user_id = req.params.id

    if (id == req.params.id) {
        User.findOne({ _id: id }, (err, result) => {
            if (err) throw err

            res.render('profile-edit', { result, id: user_id })
        })
    }
})

// DELETE with 404 Status
router.delete('/edit/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        await user.remove()
        res.send({ data: true })
    } catch {
        res.status(404).send({ error: 'User is not found' })
    }
})


// UPDATE with 500 Status
router.patch('/edit/:id', async (req, res, next) => {
    try {
        const filter = req.params.id
        const update = req.body
        const result = await User.findOneAndUpdate({ _id: filter }, update)

        req.flash('sucess_msg', 'You are now registered please log in to continue')
        res.redirect('/dashboard')
    } catch (err) {
        res.status(500).send({ message: "gg" })
    }
})

module.exports = router;