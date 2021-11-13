const express = require('express');
const router = express.Router();
const authUtils = require('../utils/crypto')
const passport = require('passport');

// Load User model
const User = require('../models/User');
const Notification = require('../models/Notification')

// Auth types
const forwardAuthenticated = require('./auth').isNotAuth;
const { isAuth } = require('./auth');

// Node Mailer
const sendMail = require("../utils/transporter")

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page for Client and Lawyer
router.get('/register/client', forwardAuthenticated, (req, res) => res.render('register-client'));
router.get('/register/lawyer', forwardAuthenticated, (req, res) => res.render('register-lawyer'));

router.post('/register/client', async (req, res, next) => {
    try {
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
        } = req.body;

        let errors = [];

        if (!username || !email || !password || !password2 || !user_fname || !user_lname || !birthdate || !contact_number || !permanent_address) errors.push({ msg: 'Please enter all fields' });

        if (username.length > 20) errors.push({ msg: 'Username cannot be longer than 20 characters' })

        if (password != password2) errors.push({ msg: 'Passwords do not match' });

        if (password.length < 6 || password.length > 20) errors.push({ msg: 'Password must be at least 6 characters, and not more than 20 characters long' });

        function renderClient() {
            res.render('register-client', {
                errors,
                username,
                email,
                password,
                password2,
                user_fname,
                user_lname,
                birthdate,
                contact_number,
                permanent_address
            });
        }

        if (errors.length > 0) {
            renderClient()
        } else {
            const userExists = await User.findOne({ username: username })
            const emailExists = await User.findOne({ email: email })

            if (userExists || emailExists) {
                if (userExists) errors.push({ msg: 'Username already exist' })
                if (emailExists) errors.push({ msg: 'Email already exist' })
                renderClient()
            } else {
                newUser = new User({
                    username,
                    email,
                    password,
                    user_fname,
                    user_lname,
                    birthdate,
                    contact_number,
                    permanent_address,
                    user_type: "client"
                });

                newUser.password = authUtils.hashPassword(password);
                newUser.save()

                const rand = newUser._id
                const title = "Registration confirmation with 3JBG Legal Web Application!"
                const link = "http://" + req.get('host') + "/verify?id=" + rand;
                const msg = `<h1>Hello ${user_fname},</h1><br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`
                sendMail(email, title, msg)

                req.flash('success_msg', 'You are now registered please log in to continue')
                res.redirect('/users/login')
            }
        }
    } catch (err) {
        next(err)
    }
})

router.post('/register/lawyer', async (req, res, next) => {
    try {
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
        } = req.body;

        let errors = [];

        if (!req.files) errors.push({ msg: 'There is no pdf file credential uploaded' })

        if (!username || !email || !password || !password2 || !user_fname || !user_lname || !birthdate || !contact_number || !permanent_address) errors.push({ msg: 'Please enter all fields' });

        if (username.length > 20) errors.push({ msg: 'Username cannot be longer than 20 characters' })

        if (password != password2) errors.push({ msg: 'Passwords do not match' });

        if (password.length < 6 || password.length > 20) errors.push({ msg: 'Password must be at least 6 characters, and not more than 20 characters long' });

        function renderLawyer() {
            res.render('register-lawyer', {
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
            });
        }

        if (errors.length > 0) {
            renderLawyer()
        } else {
            const userExists = await User.findOne({ username: username })
            const emailExists = await User.findOne({ email: email })

            if (userExists || emailExists) {
                if (userExists) errors.push({ msg: 'Username already exist' })
                if (emailExists) errors.push({ msg: 'Email already exist' })
                renderLawyer()
            } else {
                const fileObj = req.files.lawyer_credential
                const lawyer_credential = Date.now() + '-' + Math.round(Math.random() * 1E9) + fileObj.name

                newUser = new User({
                    username,
                    email,
                    password,
                    user_fname,
                    user_lname,
                    birthdate,
                    contact_number,
                    permanent_address,
                    lawyer_credential,
                    user_type: "lawyer",
                    is_available: false,
                    verified_lawyer: false
                });

                fileObj.mv('./public/uploads/credentials/' + lawyer_credential)

                newUser.password = authUtils.hashPassword(password);
                newUser.save()

                const rand = newUser._id
                const title = "Registration confirmation with 3JBG Legal Web Application!"
                const link = "http://" + req.get('host') + "/verify?id=" + rand;
                const msg = `<h1>Hello ${user_fname},</h1><br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`
                sendMail(email, title, msg)

                req.flash('success_msg', 'You are now registered please log in to continue')
                res.redirect('/users/login')
            }
        }



    } catch (err) {
        next(err)
    }
})

router.get('/resend-email', isAuth, async (req, res, next) => {
    try {
        const rand = (req.user._id)
        const myUser = await User.findOne({ _id: rand })
        const title = "Registration confirmation with 3JBG Legal Web Application!"
        const link = "http://" + req.get('host') + "/verify?id=" + rand;
        const msg = `<h1>Hello ${myUser.user_fname},</h1><br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`
        sendMail(myUser.email, title, msg)

        res.redirect('/unverified')
    } catch (err) {
        next(err)
    }
})

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
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');

});

/**
 * -------------- PROTECTED ROUTES ----------------
 */

// Public Profile View
router.get('/:id', isAuth, (req, res, next) => {
    const id = (req.user._id)
    const _id = req.params.id

    if (_id.match(/^[0-9a-fA-F]{24}$/)) {
        User.findOne({ _id }, async (err, result) => {
            if (err) next(err)

            const notifications = await Notification.find({ target: id })

            res.render('public-profile', { result, user_id: id, param_id: _id, notifications })
        })
    } else {
        throw new Error('There is no user with that kind of ID')

    }
})

// Profile Edit View
router.get('/edit/:id', isAuth, (req, res, next) => {
    const id = (req.user._id)

    try {
        if (id == req.params.id) {
            User.findOne({ _id: id }, async (err, result) => {
                if (err) next(err)

                const notifications = await Notification.find({ target: id })

                res.render('profile-edit', { result, user_id: id, notifications })
            })
        }
        else {
            throw new Error("You do not have authority to view that profile's edit page")
        }
    } catch (err) {
        next(err)
    }

})

// UPDATE
router.patch('/edit/:id', isAuth, async (req, res, next) => {
    try {
        const filter = req.params.id
        const update = req.body

        const {
            user_fname,
            user_lname,
            birth_date,
            contact_number,
            permanent_address,
            organization,
            description,
            user_type
        } = req.body

        let background = []

        if (user_type == "lawyer" && organization && description) {
            if (Array.isArray(organization) && Array.isArray(description)) {
                const mapArrays = (options, values) => {
                    const res = [];
                    for (let i = 0; i < options.length; i++) {
                        res.push({
                            organization: options[i],
                            description: values[i]
                        });
                    };
                    return res;
                };
                background = (mapArrays(organization, description));
            } else {
                background.push({
                    organization,
                    description
                })
            }
        }

        // This does not work, add a new patch for background
        await User.findByIdAndUpdate({ _id: filter }, { user_fname, user_lname, birth_date, contact_number, permanent_address })

        if (user_type == "lawyer" && organization && description) {
            await User.findByIdAndUpdate({ _id: filter }, { $set: { background } })

        } else if (user_type == "lawyer") {
            await User.findByIdAndUpdate({ _id: filter }, { $unset: { background } })
        }

        req.flash('success_msg', 'Profile Succesfully Updated')
        res.redirect('/users/' + filter)
    } catch (err) {
        next(err)
    }
})

router.patch('/edit/background/:id', async (req, res, next) => {
    try {

    } catch (err) {
        next(err)
    }
})

router.patch('/edit/public/:id', isAuth, async (req, res, next) => {
    try {
        const filter = req.params.id
        const update = await User.findOne({ _id: filter })
        is_public = !update.is_public
        await User.findOneAndUpdate({ _id: filter }, { is_public })
        const message = !update.is_public ? "public" : "private"

        req.flash('success_msg', `Profile is now ${message}`)
        res.redirect('/users/' + filter)
    } catch (err) {
        next(err)
    }
})

router.patch('/edit/is_available/:id', isAuth, async (req, res, next) => {
    try {
        const filter = req.params.id
        const update = await User.findOne({ _id: filter })
        is_available = !update.is_available
        await User.findOneAndUpdate({ _id: filter }, { is_available })
        const message = !update.is_available ? "available" : "unavailable"

        req.flash('success_msg', `You are now ${message} for service`)
        res.redirect('/users/' + filter)
    } catch (err) {
        next(err)
    }
})

module.exports = router;