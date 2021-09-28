const express = require('express')
const router = express.Router()

// Load User model
const User = require('../models/User');

// Auth types
const isClient = require('./auth').isClient
const isNotAuth = require('./auth').isNotAuth
const isAuth = require('./auth').isAuth
const { ObjectId } = require('bson');


// Welcome Page
router.get('/', isNotAuth, (req, res) => res.render('index'))

// Protected Routes

// Dashboard
router.get('/dashboard', isAuth, (req, res) => {
    const id = ObjectId(req.user._id)

    User.find({}).populate('complaints').exec(async (err, data) => {
        if (err) throw err

        let user_doc = await User.findOne({ _id: id })

        const user_type = user_doc.user_type

        res.render('dashboard', {
            user_id: id,
            result: data,
            user_type: user_type
        });
    })
});

module.exports = router;