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
  let page = parseInt(req.query.page);
  let size = parseInt(req.query.size);
  let filter = req.query.filter;
  if (!page) page = 1;
  if (!size) size = 10;
  if (!filter) filter = "";

  const startIndex = (page - 1) * size;
  const endIndex = page * size;
  try {
    User.find({ user_type: "lawyer", is_available: true }).exec(
      async (err, data) => {
        if (err) next(err);

        let user_doc = await User.findOne({ _id: id }).populate("complaints");
        let complaints = user_doc.complaints;
        // SORT COMPLAINTS
        complaints.sort((a, b) => {
          if (a["case_status"] < b["case_status"]) return -1;
          if (a["case_status"] > b["case_status"]) return 1;
          return 0;
        });

        if (filter != "") {
          complaints = complaints.filter((complaint) => {
            if (complaint.case_status == filter) return complaint;
          });
        }

        const notifications = await Notification.find({ target: id });
        const complaintResults = complaints.slice(startIndex, endIndex);

        res.render("dashboard", {
          user_id: id,
          result: data,
          user_doc,
          complaintResults,
          endingLink: Math.ceil(complaints.length / 10),
          page,
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

router.get('/faq', async (req, res, next) => {
  try {
    res.render('faq')
  } catch (err) {
    next(err)
  }
})

module.exports = router;
