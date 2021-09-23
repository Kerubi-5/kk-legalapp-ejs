const express = require('express');;
const router = express.Router()

// Load User model
const User = require('../models/User');

// Auth types
const isClient = require('./auth').isClient
const isLawyer = require('./auth').isLawyer
const isAdmin = require('./auth').isAdmin

// Welcome Page
router.get('/', (req, res) => res.render('index'))

router.get('/about', (req, res) => {
    res.render('about')
})

// Protected Routes

// Dashboard
router.get('/dashboard', isClient, (req, res) => {
    User.findOne({ _id: req.user._id }, (err, result) => {
        if (err) throw err

        res.render('dashboard', { result })
    })
});


module.exports = router;