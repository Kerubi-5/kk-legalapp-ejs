const express = require("express");
const router = express.Router();

// Load User model
const User = require("../models/User");
const Notification = require("../models/Notification");

// Auth types
const isClient = require("./auth").isClient;
const isNotAuth = require("./auth").isNotAuth;
const isAuth = require("./auth").isAuth;
const { ObjectId } = require("bson");

router.get("/", async (req, res) => {
  res.render("./admin/dashboard", { layout: "./layouts/admin-layout" });
});

router.get("/accounts", async (req, res) => {
  res.render("./admin/accounts-authentication", {
    layout: "./layouts/admin-layout",
  });
});

router.get("/accounts/lawyer", async (req, res) => {
  res.render("./admin/lawyers", { layout: "./layouts/admin-layout" });
});

router.get("/accounts/client", async (req, res) => {
  res.render("./admin/clients", { layout: "./layouts/admin-layout" });
});

router.get("/pending", async (req, res) => {
  res.render("./admin/pending", { layout: "./layouts/admin-layout" });
});

module.exports = router;
