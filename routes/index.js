const express = require("express");
const router = express.Router();

// Load User model
const User = require("../models/User");
const Notification = require("../models/Notification");

// Auth types
const isAuth = require("./auth").isAuth;
const isClientOrLawyer = require("./auth").isClientOrLawyer;
const { ObjectId } = require("bson");

// Welcome Page
router.get("/", (req, res) => res.render("index"));

// Protected Routes

// Dashboard
router.get("/dashboard", isClientOrLawyer, (req, res, next) => {
  const id = ObjectId(req.user._id);
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let size = req.query.size ? parseInt(req.query.size) : 2;
  const startIndex = (page - 1) * size;
  const endIndex = page * size;

  try {
    User.find({ user_type: "lawyer", is_available: true }).exec(
      async (err, data) => {
        if (err) next(err);

        let user_doc = await User.findOne({ _id: id }).populate("complaints");
        let complaints = user_doc.complaints;

        // if (filter != "") {
        //   complaints = complaints.filter((complaint) => {
        //     if (complaint.case_status == filter) return complaint;
        //   });
        // }

        const numberOfPages = Math.ceil(complaints.length / size)

        let iterator = (page - 5) < 1 ? 1 : page - 5;
        let endingLink = (iterator + 5) <= numberOfPages ? (iterator + 5) : page + (numberOfPages - page);

        const notifications = await Notification.find({ target: id });
        const complaintResults = complaints.slice(startIndex, endIndex);

        console.log(iterator)
        console.log(endingLink)
        res.render("dashboard", {
          user_id: id,
          result: data,
          user_doc,
          complaintResults,
          page,
          iterator,
          endingLink,
          size,
          notifications,
        });
      }
    );
  } catch (err) {
    next(err)
  }
});

router.get("/notification/:id", isAuth, async (req, res, next) => {
  try {
    const id = ObjectId(req.params.id);
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
      await User.findByIdAndUpdate({ _id: ObjectId(id) }, { is_verified: true })
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

module.exports = router;
