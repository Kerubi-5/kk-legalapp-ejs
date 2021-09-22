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

// Dashboard
router.get('/dashboard', isClient, (req, res) => res.render('dashboard'));
module.exports = router;