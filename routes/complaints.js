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

// COMPLAINT POST SUBMIT
router.post('/consultation', isClient, (req, res) => {
    const client_id = ObjectId(req.user._id)
    const lawyer_id = ObjectId(req.body.lawyer_id)

    const {
        parent_name,
        parent_address,
        service_id,
        files_and_attachments,
    } = req.body

    let errors = []

    if (!service_id || !files_and_attachments || lawyer_id) {
        errors.push('Please fill all the required fields')
    }

    // if (errors.length > 0) {
    //     res.render('dashboard', {
    //         errors,
    //         user_id: client_id,
    //         result: req.user
    //     })
    // } else {
    let newComplaint = new Complaint()

    // If minor or not
    if (!parent_name) {
        newComplaint = new Complaint({
            client_id,
            files_and_attachments,
            lawyer_id
        })
    } else {
        newComplaint = new Complaint({
            client_id,
            parent_name,
            parent_address,
            files_and_attachments,
            lawyer_id
        })
    }

    newComplaint.save()

    // Find User Client
    User.findOne({ _id: client_id, user_type: 'client' }, (err, result) => {
        if (err) throw err
        result.complaints.push(newComplaint)
        result.save()
    })

    // Find User Lawyer
    User.findOne({ _id: lawyer_id, user_type: 'lawyer' }, (err, result) => {
        if (err) throw err
        result.complaints.push(newComplaint)
        console.log(result)
        result.save()
    })

    req.flash('sucess_msg', 'Complaint Successfully Submitted')
    res.redirect('/dashboard')
    //}
})


// TRANSACTION VIEW
router.get('/:id', (req, res) => {

})

module.exports = router