const express = require("express");
const router = express.Router();

// Load User model
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const Solution = require("../models/Solution")

// Auth types
const isClient = require("./auth").isClient;
const isLawyer = require("./auth").isLawyer;
const isAdmin = require("./auth").isAdmin;
const isAuth = require("./auth").isAuth;
const { ObjectId } = require("bson");

// COMPLAINT VIEW TRANSACTION ONGOING
router.get("/complaints/:id", isAuth, (req, res) => {
  const user_id = ObjectId(req.user._id);
  const complaint_id = ObjectId(req.params.id);

  Complaint.findOne({ _id: complaint_id })
    .populate("client_id")
    .populate("lawyer_id")
    .exec(async (err, result) => {
      if (err) throw err;

      let user_doc = await User.findOne({ _id: user_id });

      const notifications = await Notification.find({ target: user_id });
      const user_type = user_doc.user_type;
      const solution = await Solution.findOne({ complaint_id: complaint_id })

      // Only users involved in this complaint will be able to see the content of the complaint
      if (
        user_id.equals(result.client_id._id) ||
        user_id.equals(result.lawyer_id._id)
      )
        res.render("consultation-view", {
          user_id: user_id,
          result,
          user_type: user_type,
          a_type: result.case_status,
          notifications,
          solution
        });
      else
        res
          .status(401)
          .send("You do not have the authority to view this resource");
    });
});

// ADVICE VIEW TRANSACTION PENDING
router.get("/advice/:id", isLawyer, (req, res) => {
  const user_id = ObjectId(req.user._id);
  const complaint_id = ObjectId(req.params.id);

  Complaint.findOne({ _id: complaint_id })
    .populate("client_id")
    .populate("lawyer_id")
    .exec(async (err, result) => {
      if (err) throw err;

      let user_doc = await User.findOne({ _id: user_id });

      const notifications = await Notification.find({ target: id });
      const user_type = user_doc.user_type;

      // Only users involved in this complaint will be able to see the content of the complaint
      if (
        user_id.equals(result.client_id._id) ||
        user_id.equals(result.lawyer_id._id)
      )
        res.render("advice-view", {
          user_id: user_id,
          result,
          user_type: user_type,
          a_type: "ongoing",
          notifications,
        });
      else
        res
          .status(401)
          .send("You do not have the authority to view this resource");
    });
});

// COMPLAINT ACCEPT UPDATED LAWYER SIDE
router.patch("/complaints/pending/:id", isLawyer, async (req, res) => {
  try {
    const filter = req.params.id;
    const { case_status, appointment_date } = req.body;

    // DATE VARIABLES FOR COMPARISON
    let myDate = new Date(appointment_date);
    let todayDate = new Date();
    let complaintResult;

    if (myDate >= todayDate) {
      complaintResult = await Complaint.findOneAndUpdate(
        { _id: filter },
        { case_status: case_status, appointment_date: appointment_date }
      );
    } else {
      complaintResult = await Complaint.findOneAndUpdate(
        { _id: filter },
        { case_status: case_status }
      );
    }

    const lawyerDeets = await User.findOne({ _id: complaintResult.lawyer_id });

    const pushNotify = new Notification({
      complaint_id: complaintResult._id,
      message: "has accepted your consultation request",
      actor: lawyerDeets.username,
      target: complaintResult.client_id,
    });

    await pushNotify.save();

    req.flash("sucess_msg", `Succesfully accepted case with id: ${filter}`);
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

// COMPLAINT POST SUBMIT
router.post("/consultation", isClient, async (req, res) => {
  const client_id = ObjectId(req.user._id);
  const lawyer_id = ObjectId(req.body.lawyer_id);
  const {
    legal_title,
    case_facts,
    adverse_party,
    case_objectives,
    client_questions,
    case_status,
  } = req.body;

  let errors = [];

  // SETTING UP FILE UPLOAD VARIABLES
  let fileObj;
  let case_file;

  if (
    !legal_title ||
    !case_facts ||
    !adverse_party ||
    !case_objectives ||
    !case_status ||
    !lawyer_id ||
    !req.files ||
    !req.body.lawyer_id ||
    !client_id
  )
    errors.push("Fill are the required fields");

  if (errors.length > 0) {
    req.flash("error_msg", "Fill all the required fields");
    res.redirect("/dashboard");
  } else {
    if (req.files) {
      fileObj = req.files.case_file;
      case_file =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + fileObj.name;
    }

    fileObj.mv("./public/uploads/evidences/" + case_file);

    const newComplaint = new Complaint({
      client_id,
      legal_title,
      case_facts,
      adverse_party,
      case_objectives,
      client_questions,
      case_status,
      case_file,
      lawyer_id,
    });

    newComplaint.save();


    // User.findOne({ _id: client_id, user_type: "client" }, (err, result) => {
    //   if (err) throw err;
    //   result.complaints.push(newComplaint);
    //   result.save();
    //   actor = result.username
    // });
    // Find User Client and push Complaint
    const client_result = await User.findOne({ _id: client_id, user_type: "client" })
    client_result.complaints.push(newComplaint)
    await client_result.save()

    // User.findOne({ _id: lawyer_id, user_type: "lawyer" }, (err, result) => {
    //   if (err) throw err;
    //   result.complaints.push(newComplaint);
    //   result.save();
    //   target = result._id
    // });
    // Find User Lawyer and push Complaint
    const lawyer_result = await User.findOne({ _id: lawyer_id, user_type: "lawyer" })
    lawyer_result.complaints.push(newComplaint)
    await lawyer_result.save()

    const pushNotify = new Notification({
      complaint_id: newComplaint._id,
      message: "has requested a consultation request",
      actor: client_result.username,
      target: lawyer_result._id,
    });

    await pushNotify.save();
    req.flash("sucess_msg", "Complaint Successfully Processed");
    res.redirect("/dashboard");
  }
});

router.get("/notification/:id", isAuth, async (req, res) => {
  const id = ObjectId(req.params.id);
  await Notification.findByIdAndDelete({ _id: id });

  res.redirect("/dashboard");
});

router.post("/complaints/ongoing/:id", isAuth, async (req, res) => {
  try {
    const id = ObjectId(req.params.id);
    const { summary, recommendations, video_link } = req.body

    const newSolution = new Solution({
      complaint_id: id,
      summary: summary,
      recommendations: recommendations,
      video_link: video_link
    })

    const complaintResult = await Complaint.findOneAndUpdate({ _id: id }, { case_status: "completed" })

    const lawyerDeets = await User.findOne({ _id: complaintResult.lawyer_id });

    const pushNotify = new Notification({
      complaint_id: complaintResult._id,
      message: "has completed your consultation request",
      actor: lawyerDeets.username,
      target: complaintResult.client_id,
    });

    await newSolution.save()
    await pushNotify.save()

    req.flash("sucess_msg", `Succesfully completed case with id: ${newSolution._id}`);
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send("Error in completing transaction");
  }
})

module.exports = router;
