const express = require("express");
const router = express.Router();

// Load User model
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const Solution = require("../models/Solution")
const Advice = require('../models/Advice')

// Auth types
const isClient = require("./auth").isClient;
const isLawyer = require("./auth").isLawyer;
const isAdmin = require("./auth").isAdmin;
const isAuth = require("./auth").isAuth;
const { ObjectId } = require("bson");

router.get("/", isAuth, async (req, res) => {
    try {
        const id = ObjectId(req.user._id);
        let page = parseInt(req.query.page);
        let size = parseInt(req.query.size);
        let filter = req.query.filter;
        if (!page) page = 1;
        if (!size) size = 10;
        if (!filter) filter = "";

        const notifications = await Notification.find({ target: id });
        const advicesDoc = await Advice.find({})
        res.render("advice-forum", {
            user_id: id,
            notifications,
            page,
            advices: advicesDoc,
            endingLink: Math.ceil(advicesDoc.length / 10)
        })
    } catch {

    }
});

router.post("/", isAuth, async (req, res) => {
    try {
        const id = ObjectId(req.user._id)
        const { legal_title, legal_description } = req.body

        const newAdvice = new Advice({
            client_id: id,
            legal_title: legal_title,
            legal_description: legal_description
        })

        await newAdvice.save()

        res.redirect('/advice')
    } catch {

    }
})

router.get("/:id", isAuth, async (req, res) => {
    try {
        const id = ObjectId(req.user._id)
        const advice_id = ObjectId(req.params.id)
        const notifications = await Notification.find({ target: id });

        const adviceDoc = await Advice.findOne({ _id: advice_id }).populate("lawyers._id")
        const userDoc = await User.findOne({ _id: adviceDoc.client_id })
        const lawyersDoc = adviceDoc.lawyers

        if (typeof adviceDocs == undefined) adviceDocs = null

        res.render("advice-view", {
            user_id: id,
            notifications,
            adviceDoc,
            userDoc,
            lawyersDoc
        })
    } catch {

    }
})

router.patch("/comment/:id", isLawyer, async (req, res) => {
    try {
        const id = ObjectId(req.user._id)
        const advice_id = ObjectId(req.params.id)
        const { answer } = req.body

        const lawyer = {
            _id: id,
            answer: answer,
        }

        const adviceDoc = await Advice.findByIdAndUpdate({ _id: advice_id }, { $push: { lawyers: lawyer } })

        res.redirect('/advice')
    } catch {

    }
})

module.exports = router