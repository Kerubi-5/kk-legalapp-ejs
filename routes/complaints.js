const express = require("express");
const router = express.Router();

// Controller
const complaintController = require("../controllers/complaintController");
const solutionController = require("../controllers/solutionController")

// Auth types
const isClient = require("./auth").isClient;
const isLawyer = require("./auth").isLawyer;
const isAuth = require("./auth").isAuth;
const isAdmin = require("./auth").isAdmin;

// COMPLAINT POST SUBMIT CLIENT SIDE
router.post("/consultation", isClient, complaintController.postComplaint);

// COMPLAINT VIEW TRANSACTION ONGOING
router.get("/complaints/:id", isAuth, complaintController.findComplaintByID);

// COMPLAINT FORM EDIT
router
  .route("/complaints/edit/:id", isAuth)
  .get(complaintController.getComplaintDetails)
  .patch(complaintController.patchComplaintDetails);

// SOLUTION EDIT
router
  .route("/solution/edit/:id", isLawyer)
  .get(solutionController.getSolutionDetails)
  .patch(solutionController.patchSolutionDetails);

// COMPLAINT ACCEPT LAWYER SIDE
router.patch("/complaints/pending", isLawyer, complaintController.acceptComplaintPending);

router.patch("/complaints/reject", isAdmin, complaintController.rejectComplaintPending);

// CLIENT SIDE COMPLETE A COMPLAINT
router.patch("/complaints/complete", isAuth, complaintController.completeComplaintOngoing);

// LAWYER SIDE COMPLAINT UPDATE AND ADD NEW SOLUTION
router.post("/complaints/ongoing/:id", isLawyer, solutionController.postSolution);

// ONGOING RESCHEDULE CLIENT SIDE
router.patch("/complaints/ongoing/:id", isAuth, complaintController.followUpSchedule);

// REFER LAWYER
router
  .route("/refer", isLawyer)
  .get(complaintController.getReferView)
  .patch(complaintController.patchReferUpdate);

module.exports = router;
