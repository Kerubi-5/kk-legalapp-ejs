const express = require("express");
const router = express.Router();

// Load User model
const User = require("../models/User");
const Notification = require("../models/Notification");

// Auth types
const isClient = require("./auth").isClient;
const isNotAuth = require("./auth").isNotAuth;
const isAuth = require("./auth").isAuth;
const isClientOrLawyer = require("./auth").isClientOrLawyer;
const { ObjectId } = require("bson");

// Welcome Page
router.get("/", isNotAuth, (req, res) => res.render("index"));

// Protected Routes

// Dashboard
router.get("/dashboard", isClientOrLawyer, (req, res) => {
  const id = ObjectId(req.user._id);
  let page = parseInt(req.query.page);
  let size = parseInt(req.query.size);
  let filter = req.query.filter;
  if (!page) page = 1;
  if (!size) size = 10;
  if (!filter) filter = "";

  const startIndex = (page - 1) * size;
  const endIndex = page * size;

  User.find({ user_type: "lawyer", is_available: true }).exec(
    async (err, data) => {
      if (err) throw err;

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
});

router.get("/unverified", (req, res) => {
  res.render("./pages/not-verified", { layout: false });
});
module.exports = router;
