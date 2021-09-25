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
const { ObjectId } = require('bson');

// This is how to populate subfields
// router.get('/', (req, res) => {
//     const id = '614c3328302dfd9f36f4907c'
//     Complaint.find({ id }).populate("client_id").populate("lawyer_id").exec((err, result) => {
//         if (err) throw err
//         res.send(result)
//     })
// })

// COMPLAINT POST CONFIRMATION VIEW
router.post('/consultation', async (req, res) => {
    //    const client_id = ObjectId(req.user._id)
    const client_id = ObjectId(req.user._id)
    const details = req.body

    res.render('consultation-confirmation', {
        user_id: client_id, details
    })
})

// COMPLAINT POST SUBMIT
router.post('/consultation/submit', (req, res) => {
    const client_id = ObjectId(req.user._id)

    const {
        parent_name,
        parent_address,
        service_id,
        files_and_attachments,
        lawyer_id,
    } = req.body

    let errors = []

    if (!service_id || !files_and_attachments || lawyer_id) {
        errors.push('Please fill all the required fields')
    }

    if (errors.length > 0) {
        res.render('dashboard', {
            errors
        })
    } else {
        let newComplaint = new Complaint
        // If minor or not
        if (!parent_name) {
            newComplaint = new Complaint({
                service_id,
                files_and_attachments,
                lawyer_id,
            })
        } else {
            newComplaint = new Complaint({
                parent_name,
                parent_address,
                service_id,
                files_and_attachments,
                lawyer_id,
            })
        }

        newComplaint.save()
        req.flash('sucess_msg', 'Complaint Successfully Submitted')
        res.redirect('/dashboard')
    }
})


// TRANSACTION VIEW
router.get('/:id', (req, res) => {

})

module.exports = router