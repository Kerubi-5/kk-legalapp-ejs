const express = require("express");
const router = express.Router();

const complaintController = require("../controllers/complaintController");
const RoutesEnum = require("../controllers/EnumTypes/RoutesEnum");

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
router.get("/dashboard", isClientOrLawyer, complaintController.index);

router.delete("/notification/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    await Notification.findByIdAndDelete({ _id: id });
  } catch (err) {
    next(err);
  }
});

router.get("/unverified", (req, res, next) => {
  try {
    res.render("./pages/not-verified", { layout: "./pages/layout-page" });
  } catch (err) {
    next(err);
  }
});

router.get("/lock", (req, res, next) => {
  try {
    res.render("./pages/lock", { layout: "./pages/layout-page" });
  } catch (err) {
    next(err);
  }
});

// EMAIL VERIFY
router.get("/verify", async (req, res, next) => {
  try {
    const id = req.query.id;
    if (!id) {
      res.send("Invalid Link");
    } else {
      await User.findByIdAndUpdate({ _id: id }, { is_verified: true });
      res.render("./pages/verified", { layout: "./pages/layout-page" });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/faq/english", async (req, res, next) => {
  try {
    res.render("faq-english", { page_name: RoutesEnum.FAQ });
  } catch (err) {
    next(err);
  }
});

router.get("/faq/tagalog", async (req, res, next) => {
  try {
    res.render("faq-tagalog", { page_name: RoutesEnum.FAQ });
  } catch (err) {
    next(err);
  }
});

// EXTERNAL LINK
router.get("/external", async (req, res, next) => {
  try {
    const link = req.query.link;
    res.status(301).redirect(link);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
