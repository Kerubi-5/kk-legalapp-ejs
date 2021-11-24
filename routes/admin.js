const express = require("express");
const router = express.Router();

// Controller
const adminController = require("../controllers/adminController")

// Auth types
const isAdmin = require("./auth").isAdmin;

router.get("/", isAdmin, adminController.index);

router.get("/accounts", isAdmin, adminController.accountsView);

// Lawyer Account Routes
router.get("/accounts/lawyer", isAdmin, adminController.lawyersView);

// Client Account Routes
router.get("/accounts/client", isAdmin, adminController.clientsView);

router.get("/accounts/:id", isAdmin, adminController.findAccountByID);

router.get("/pending", isAdmin, adminController.complaintView);

// COMPLAINT VERIFICATION
router
  .route("/pending/:id", isAdmin)
  .get(adminController.findComplaintByID)
  .patch(adminController.complaintVerify);

router.patch("/verification/:id", isAdmin, adminController.unlockUserByID);

router.get("/accounts/lock/:id", isAdmin, adminController.lockUserByID);

module.exports = router;
