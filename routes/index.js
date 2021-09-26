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

    // User.find({}, function (err, data) {
    //     if (err) throw err
    //     let complaints = []
    //     if (data._id == id) {
    //         complaints = data.complaints
    //         console.log(data.complaints)
    //     }
    //     console.log(data.complaints)

    //     res.render('dashboard', {
    //         result: data,
    //         user_id: id,
    //         complaints
    //     });
    // });

    User.find({}).populate('complaints').exec(async (err, data) => {
        if (err) throw err

        res.render('dashboard', {
            result: data,
            user_id: id,
        });
    })
});

module.exports = router;