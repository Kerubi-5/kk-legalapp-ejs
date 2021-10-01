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
const isAuth = require('./auth').isAuth
const { ObjectId } = require('bson');



// COMPLAINT VIEW TRANSACTION ONGOING
router.get('/complaints/:id', isAuth, (req, res) => {
    const user_id = ObjectId(req.user._id)
    const complaint_id = ObjectId(req.params.id)

    Complaint.findOne({ _id: complaint_id }).populate("client_id").populate("lawyer_id").exec(async (err, result) => {
        if (err) throw err

        let user_doc = await User.findOne({ _id: user_id })

        const user_type = user_doc.user_type

        // Only users involved in this complaint will be able to see the content of the complaint
        if (user_id.equals(result.client_id._id) || user_id.equals(result.lawyer_id._id))
            res.render('consultation-view', { user_id: user_id, result, user_type: user_type, a_type: result.case_status })
        else
            res.status(401).send("You do not have the authority to view this resource")
    })
})

// ADVICE VIEW TRANSACTION PENDING
router.get('/advice/:id', isLawyer, (req, res) => {
    const user_id = ObjectId(req.user._id)
    const complaint_id = ObjectId(req.params.id)

    Complaint.findOne({ _id: complaint_id }).populate("client_id").populate("lawyer_id").exec(async (err, result) => {
        if (err) throw err

        let user_doc = await User.findOne({ _id: user_id })

        const user_type = user_doc.user_type

        // Only users involved in this complaint will be able to see the content of the complaint
        if (user_id.equals(result.client_id._id) || user_id.equals(result.lawyer_id._id))
            res.render('advice-view', { user_id: user_id, result, user_type: user_type, a_type: "ongoing" })
        else
            res.status(401).send("You do not have the authority to view this resource")
    })
})

// COMPLAINT ACCEPT UPDATED LAWYER SIDE
router.patch('/complaints/pending/:id', isLawyer, async (req, res) => {
    try {
        const filter = req.params.id
        const update = req.body.case_status
        await Complaint.findOneAndUpdate({ _id: filter }, { case_status: update })

        req.flash('sucess_msg', `Succesfully accepted case with id: ${filter}`)
        res.redirect('/dashboard')
    } catch (err) {
        res.status(500).send({ error: "There was an error in updating the complaint" })
    }
})

// COMPLAINT POST SUBMIT
router.post('/consultation', isClient, (req, res) => {
    const client_id = ObjectId(req.user._id)
    const lawyer_id = ObjectId(req.body.lawyer_id)
    const {
        legal_title,
        case_facts,
        adverse_party,
        case_objectives,
        client_questions,
        case_status
    } = req.body

    let errors = []

    // SETTING UP FILE UPLOAD
    let fileObj
    let case_file
    if (req.files) {
        case_file = req.files.case_file.name
        fileObj = req.files.case_file
    }

    if (!legal_title || !case_facts || !adverse_party || !case_objectives || !case_status || !lawyer_id || !req.files || !req.body.lawyer_id || !client_id) errors.push("Fill are the required fields")

    if (errors.length > 0) {
        req.flash('error_msg', 'Fill all the required fields')
        res.redirect('/dashboard')
    } else {
        const newComplaint = new Complaint({
            client_id,
            legal_title,
            case_facts,
            adverse_party,
            case_objectives,
            client_questions,
            case_status,
            case_file,
            lawyer_id
        })

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
            result.save()
        })

        fileObj.mv('./public/uploads/evidences/' + case_file)
        req.flash('sucess_msg', 'Complaint Successfully Submitted')
        res.redirect('/dashboard')
    }
})

module.exports = router