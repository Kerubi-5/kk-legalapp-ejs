const { ObjectID } = require('bson')
const express = require('express')
const router = express.Router()

// Load User model
const User = require('../models/User');

// Auth types
const { isClient } = require('./auth')

// Welcome Page
router.get('/', (req, res) => res.render('index'))

// Protected Routes

// Dashboard
router.get('/dashboard', isClient, (req, res) => {
    const id = ObjectID(req.user._id)

    User.find({}, function (err, data) {
        if (err) throw err
        // note that data is an array of objects, not a single object!
        res.render('dashboard', {
            result: data,
            user_id: id
        });
    });


});

module.exports = router;