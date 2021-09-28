const express = require('express')
const router = express.Router()

// Load User model
const User = require('../models/User');

// Auth types
const isClient = require('./auth').isClient
const isNotAuth = require('./auth').isNotAuth
const { ObjectId } = require('bson');


// Welcome Page
router.get('/', isNotAuth, (req, res) => res.render('index'))

// Protected Routes

// Dashboard
router.get('/dashboard', isClient, (req, res) => {
    const id = ObjectId(req.user._id)

    User.find({}).populate('complaints').exec(async (err, data) => {
        if (err) throw err

        res.render('dashboard', {
            result: data,
            user_id: id,
        });
    })
});

module.exports = router;