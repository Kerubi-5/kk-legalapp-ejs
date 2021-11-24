const express = require("express");
const router = express.Router();

// Controller
const adviceController = require("../controllers/adviceController");

// Auth types
const isLawyer = require("./auth").isLawyer;
const isAuth = require("./auth").isAuth;

router.route("/", isAuth)
  .get(adviceController.index)
  .post(adviceController.submitPost)

router.get("/main", isAuth, adviceController.adminPost);

router.get("/:id", isAuth, adviceController.findPostById);

router.patch("/comment/:id", isLawyer, adviceController.postComment);

router.get("/vote/:id", isAuth, adviceController.markPostResolved);

module.exports = router;
