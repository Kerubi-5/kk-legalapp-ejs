const express = require("express");
const router = express.Router();
const passport = require("passport");

// Controller
const userController = require("../controllers/userController");

// Auth types
const forwardAuthenticated = require("./auth").isNotAuth;
const { isAuth } = require("./auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page for Client and Lawyer
router.get("/register/client", forwardAuthenticated, (req, res) =>
  res.render("register-client")
);
router.get("/register/lawyer", forwardAuthenticated, (req, res) =>
  res.render("register-lawyer")
);

router.post("/register", userController.userRegister);

router.get("/resend-email", isAuth, userController.resendEmail);

// Login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

/**
 * -------------- PROTECTED ROUTES ----------------
 */

// Public Profile View
router.get("/:id", isAuth, userController.userView);

// Profile Edit View
router.get("/edit/:id", isAuth, userController.editUserView);

// UPDATE BACKGROUND
router.patch("/edit/:id", isAuth, userController.editUserPatch);

// SET PROFILE VISIBILITY
router.patch("/edit/public/:id", isAuth, userController.setProfileVisibility);

// SET DATE AVAILABILITY
router.patch("/edit/available/:id", isAuth, userController.setLawyerAvailability);

module.exports = router;
