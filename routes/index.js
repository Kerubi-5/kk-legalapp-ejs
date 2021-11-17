const express = require("express");
const router = express.Router();

// Load User model
const User = require("../models/User");
const Notification = require("../models/Notification");

// Auth types
const isAuth = require("./auth").isAuth;
const isClientOrLawyer = require("./auth").isClientOrLawyer;

// Welcome Page
router.get("/", (req, res) => res.render("index"));

// Protected Routes

// Dashboard
router.get("/dashboard", isClientOrLawyer, async (req, res, next) => {
  const id = (req.user._id);

  try {
    const available_lawyers = await User.find({ user_type: "lawyer", is_available: true })
    let user_doc = await User.findOne({ _id: id }).populate("complaints");
    let complaints = user_doc.complaints;
    const notifications = await Notification.find({ target: id });

    res.render("./complaint/index", {
      user_id: id,
      result: available_lawyers,
      user_doc,
      complaintResults: complaints,
      notifications,
    });
  } catch (err) {
    next(err)
  }
});

router.get("/notification/:id", isAuth, async (req, res, next) => {
  try {
    const id = (req.params.id);
    await Notification.findByIdAndDelete({ _id: id });

    res.redirect("/dashboard");
  } catch (err) {
    next(err)
  }
});

router.get("/unverified", (req, res, next) => {
  try {
    res.render("./pages/not-verified", { layout: "./pages/layout-page" });
  } catch (err) {
    next(err)
  }
});

router.get("/unverified-lawyer", (req, res, next) => {
  try {
    res.render("./pages/unverified-lawyer", { layout: "./pages/layout-page" })
  } catch (err) {
    next(err)
  }
})

// EMAIL VERIFY
router.get('/verify', async (req, res, next) => {
  try {
    const id = req.query.id
    if (!id) {
      res.send("Invalid Link")
    } else {
      await User.findByIdAndUpdate({ _id: id }, { is_verified: true })
      res.render("./pages/verified", { layout: "./pages/layout-page" })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/faq/english', async (req, res, next) => {
  try {
    res.render('faq-english')
  } catch (err) {
    next(err)
  }
})

router.get('/faq/tagalog', async (req, res, next) => {
  try {
    res.render('faq-tagalog')
  } catch (err) {
    next(err)
  }
})

// EXTERNAL LINK
router.get("/external", async (req, res, next) => {
  try {
    const link = req.query.link
    res.status(301).redirect(link)

  } catch (err) {
    next(err)
  }
})

module.exports = router;
