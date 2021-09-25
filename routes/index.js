const express = require('express')
const router = express.Router()

// Load User model
const User = require('../models/User');

// Auth types
const { isClient, isNotAuth } = require('./auth')

const { ObjectID } = require('bson')

// Welcome Page
router.get('/', isNotAuth, (req, res) => res.render('index'))

// Protected Routes

// Dashboard
router.get('/dashboard', isClient, (req, res) => {
    const id = ObjectID(req.user._id)

    User.find({}, function (err, data) {
        if (err) throw err

        res.render('dashboard', {
            result: data,
            user_id: id
        });
    });
});

module.exports = router;