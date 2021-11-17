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
const isAuth = require("./auth").isAuth;

// Node Mailer
const sendMail = require("../utils/transporter")

// Node FS
const fs = require('fs')

// COMPLAINT POST SUBMIT CLIENT SIDE
router.post("/consultation", isClient, async (req, res, next) => {
  try {
    const client_id = (req.user._id);
    const lawyer_id = (req.body.lawyer_id);
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
    let case_files;

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
        fileObj = req.files.case_files;
        case_files =
          Date.now() + "-" + Math.round(Math.random() * 1e9) + fileObj.name;
      }

      fileObj.mv("./public/uploads/evidences/" + case_files);

      const newComplaint = new Complaint({
        client_id,
        legal_title,
        case_facts,
        adverse_party,
        case_objectives,
        client_questions,
        case_status,
        case_files,
        lawyer_id,
      });

      newComplaint.save();

      // Find User Client and push Complaint
      const client_result = await User.findOne({ _id: client_id, user_type: "client" })
      client_result.complaints.push(newComplaint)
      await client_result.save()

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
      req.flash("success_msg", "Complaint Successfully Processed");
      res.redirect("/dashboard");
    }
  } catch (err) {
    next(err)
  }
});

// COMPLAINT VIEW TRANSACTION ONGOING
router.get("/complaints/:id", isAuth, (req, res, next) => {
  try {
    const user_id = (req.user._id);
    const complaint_id = (req.params.id);

    Complaint.findOne({ _id: complaint_id })
      .populate("client_id")
      .populate("lawyer_id")
      .populate("solutions")
      .exec(async (err, result) => {
        if (err) next(err);

        let user_doc = await User.findOne({ _id: user_id });

        const notifications = await Notification.find({ target: user_id });
        const user_type = user_doc.user_type;

        // Only users involved in this complaint will be able to see the content of the complaint
        if (
          user_id === result.client_id._id ||
          user_id === result.lawyer_id._id
        )
          res.render("./complaint/complaint-view", {
            user_id: user_id,
            result,
            user_type: user_type,
            a_type: result.case_status,
            notifications,
            solutions: result.solutions
          });
        else throw new Error('You do not have authority to view this complaint')
      });
  } catch (err) {
    next(err)
  }
});

// COMPLAINT FORM EDIT
router.route("/complaints/edit/:id")
  .get(async (req, res, next) => {
    try {

    } catch (err) {
      next(err)
    }
    // const user_id = req.user._id
    const complaint_id = req.params.id;
    const result = await Complaint.findById({ _id: complaint_id }).populate('client_id').populate('lawyer_id')
    // const notifications = await Notification.find({ target: user_id })
    // res.render('./complaint/complaint-edit', { user_id, result, notifications })
    res.json(result)
  })
  .patch(async (req, res, next) => {
    try {
      const id = req.params.id
      const files = req.files ? req.files.case_files : ""
      const {
        legal_title,
        case_facts,
        adverse_party,
        case_objectives,
        client_questions
      } = req.body

      let case_files = []
      let errors = []

      if (!legal_title || !case_facts || !adverse_party || !case_objectives || !client_questions || !files) errors.push("There are missing fields")

      if (errors.length > 0) req.flash('error_msg', 'There are some missing fields')
      else {
        const complaintResult = await Complaint.findById(id)
        const fileNames = complaintResult.case_files
        // Uploading File
        if (Array.isArray(files)) {
          for (let index = 0; index < files.length; index++) {
            let case_file = Date.now() + "-" + Math.round(Math.random() * 1e9) + files[index].name;
            case_files.push(case_file)
            files[index].mv("./public/uploads/evidences/" + case_file);
          }
        } else {
          let case_file = Date.now() + "-" + Math.round(Math.random() * 1e9) + files.name;
          case_files.push(case_file)
          files.mv("./public/uploads/evidences/" + case_file)
        }

        // DELETING FILE
        if (fileNames) {
          fileNames.forEach(element => {
            fs.unlink(`./public/uploads/evidences/${element}`, (err) => {
              if (err) {
                next(err)
              }
            })
          });
        }

        await Complaint.findByIdAndUpdate({ _id: id }, { legal_title: legal_title, case_facts: case_facts, adverse_party: adverse_party, case_objectives: case_objectives, client_questions: client_questions, case_files: case_files })
        // SET NEW ARRAY FILES
        await Complaint.findByIdAndUpdate({ _id: id }, { $set: { case_files: case_files } })
        req.flash('success_msg', 'Succesfully edited complaint form')
      }
      res.redirect('/form/complaints/' + id)
    } catch (err) {
      next(err)
    }
  })

// COMPLAINT ACCEPT LAWYER SIDE
router.patch("/complaints/pending", isLawyer, async (req, res, next) => {
  try {
    const filter = req.body.id;
    const { case_status, appointment_date, meeting_link } = req.body;
    let error = false

    // DATE VARIABLES FOR COMPARISON
    const myDate = new Date(appointment_date)
    const todayDate = new Date(Date.now())

    if (myDate.getTime() >= todayDate) {

      const complaintResult = await Complaint.findOneAndUpdate(
        { _id: filter },
        { case_status: case_status, appointment_date: appointment_date, meeting_link: meeting_link }
      );

      const lawyerDeets = await User.findOne({ _id: complaintResult.lawyer_id });
      const clientDeets = await User.findOne({ _id: complaintResult.client_id });

      const link = "http://" + req.get('host')
      const title = `Your consultation request ${complaintResult.legal_title} has been approved!`
      const msg = `<h1>Hello ${clientDeets.user_fname},</h1><br> Your consultation request with lawyer ${lawyerDeets.user_fname} has been approved.<br><a href=${link}>Click here to visit website</a>`
      sendMail(clientDeets.email, title, msg)

      const pushNotify = new Notification({
        complaint_id: complaintResult._id,
        message: "has accepted your consultation request",
        actor: lawyerDeets.username,
        target: complaintResult.client_id,
      });

      await pushNotify.save();
    } else {
      error = true
      req.flash('error_msg', 'Date should be now or later')
    }

    if (!error) req.flash("success_msg", `Succesfully accepted case with id: ${filter}`);
    res.redirect("/form/complaints/" + filter);
  } catch (err) {
    next(err)
  }
});

router.patch("/complaints/reject", isLawyer, async (req, res, next) => {
  try {
    const filter = req.body.id
    const case_status = req.body.case_status
    complaintResult = await Complaint.findOneAndUpdate(
      { _id: filter },
      { case_status: case_status }
    );

    res.redirect("/form/complaints/" + filter);
  } catch (err) {
    next(err)
  }
})

// CLIENT SIDE COMPLETE A COMPLAINT
router.patch("/complaints/complete", isAuth, async (req, res, next) => {
  try {
    const id = (req.body.id)
    await Complaint.findByIdAndUpdate({ _id: id }, { case_status: "completed" })

    res.redirect('/form/complaints/' + req.body.id)
  } catch (err) {
    next(err)
  }
})

// LAWYER SIDE COMPLAINT UPDATE AND ADD NEW SOLUTION
router.post("/complaints/ongoing/:id", isAuth, async (req, res, next) => {
  try {
    const id = (req.params.id);
    const { summary, recommendations, video_link } = req.body

    const newSolution = new Solution({
      complaint_id: id,
      summary: summary,
      recommendations: recommendations,
      video_link: video_link
    })

    // Updating Complaint and Inserting new Solution
    const complaintResult = await Complaint.findOne({ _id: id })
    complaintResult.case_status = "in progress"
    complaintResult.solutions.push(newSolution)
    await complaintResult.save()

    const lawyerDeets = await User.findOne({ _id: complaintResult.lawyer_id });

    const pushNotify = new Notification({
      complaint_id: complaintResult._id,
      message: "has updated your consultation request",
      actor: lawyerDeets.username,
      target: complaintResult.client_id,
    });

    await newSolution.save()
    await pushNotify.save()

    req.flash("success_msg", `Succesfully updated case with id: ${id}`);
    res.redirect("/form/complaints/" + id);
  } catch (err) {
    next(err)
  }
})



module.exports = router;
