const express = require("express");
const router = express.Router();
const passport = require("passport");

// Load User model
const User = require("../models/User");
const Advice = require("../models/Advice")
const Complaint = require("../models/Complaint")

// Auth types
const isAdmin = require("./auth").isAdmin;
const isNotAuth = require("./auth").isNotAuth;
const isAuth = require("./auth").isAuth;
const forwardAuthenticated = require("./auth").isNotAuth;
const { ObjectId } = require("bson");

router.get("/", isAdmin, async (req, res) => {
  const clientCount = await User.count({ user_type: "client" });
  const lawyerCount = await User.count({ user_type: "lawyer" });
  const advicesCount = await Advice.count({})
  const resolvedAdvicesCount = await Advice.count({ is_resolved: true })
  const complaintsCount = await Complaint.count({})
  const complaintsCompletedCount = await Complaint.count({ case_status: "completed " })

  res.render("./admin/dashboard", {
    layout: "./layouts/admin-layout",
    clientCount,
    lawyerCount,
    advicesCount,
    resolvedAdvicesCount,
    complaintsCount,
    complaintsCompletedCount
  });
});

router.get("/accounts", isAdmin, async (req, res) => {
  const accountsDoc = await User.find({ is_verified: false })

  res.render("./admin/accounts-authentication", {
    layout: "./layouts/admin-layout",
    accountsDoc
  });
});

// Lawyer Account Routes
router.get("/accounts/lawyer", isAdmin, async (req, res) => {
  const lawyerDocs = await User.find({ user_type: "lawyer" })
  res.render("./admin/lawyers", { layout: "./layouts/admin-layout", lawyerDocs });
});

// Client Account Routes
router.get("/accounts/client", isAdmin, async (req, res) => {
  const clientDocs = await User.find({ user_type: "client" })
  res.render("./admin/clients", { layout: "./layouts/admin-layout", clientDocs });
});

router.get("/accounts/:id", isAdmin, async (req, res) => {
  const id = ObjectId(req.params.id)
  const user_client = await User.findById({ layout: false, _id: id })

  res.render("./admin/user-view", { layout: false, user: user_client })
})

router.get("/pending", isAdmin, async (req, res) => {
  res.render("./admin/pending", { layout: "./layouts/admin-layout" });
});

// VERIFY USER
router.get("/verification/:id", isAdmin, async (req, res) => {
  const id = req.params.id
  const user = await User.findOne({ _id: id })

  res.render("./admin/verification-view", { layout: false, user })
})

router.patch("/verification/:id", isAdmin, async (req, res) => {
  const id = ObjectId(req.params.id)

  await User.findByIdAndUpdate({ _id: id }, { is_verified: true })
  req.flash("success_msg", "Successfully verified a user")
  res.redirect('/admin/accounts')
})

router.get("/accounts/lock/:id", isAdmin, async (req, res) => {
  const id = ObjectId(req.params.id)

  await User.findByIdAndUpdate({ _id: id }, { is_verified: false })
  req.flash("success_msg", "Successfully locked account")
  res.redirect('/admin/accounts')
})

router.get("/")

module.exports = router;
