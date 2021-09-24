const express = require('express');;
const router = express.Router()

// Load User model
const User = require('../models/User');
const Service = require('../models/Service')
const Complaint = require('../models/Complaint')

// Auth types
const isClient = require('./auth').isClient
const isLawyer = require('./auth').isLawyer
const isAdmin = require('./auth').isAdmin;

// This is how to populate subfields
// router.get('/', (req, res) => {
//     const id = '614c3328302dfd9f36f4907c'
//     Complaint.find({ id }).populate("client_id").populate("lawyer_id").exec((err, result) => {
//         if (err) throw err
//         res.send(result)
//     })
// })

module.exports = router