// Load User model
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

// Node Mailer
const sendMail = require("../utils/transporter");

// Node FS
const fs = require("fs");

// Enums
const CaseStatusesEnum = require("./EnumTypes/CaseStatusesEnum");
const ComplaintStatusesEnum = require("./EnumTypes/ComplaintStatusesEnum");
const RoutesEnum = require("./EnumTypes/RoutesEnum");

exports.index = async (req, res, next) => {
  const id = req.user._id;

  try {
    const todayDate = new Date();
    // QUERY ALL LAWYERS ONLY AVAILBLE <= TODAY DATE AND >= TODAY DATE
    const available_lawyers = await User.find({
      user_type: "lawyer",
      "availability.start_date": { $lte: todayDate },
      "availability.end_date": { $gte: todayDate },
    });
    let user_doc = await User.findOne({ _id: id }).populate("complaints");
    let complaints = user_doc.complaints;
    const notifications = await Notification.find({ target: id });

    res.render("./complaint/index", {
      currentUser: req.user,
      result: available_lawyers,
      user_doc,
      complaintResults: complaints.filter(
        (element) => element.is_verified == true
      ),
      notifications,
      todayDate,
      page_name: RoutesEnum.DASHBOARD,
    });
  } catch (err) {
    next(err);
  }
};

exports.postComplaint = async (req, res, next) => {
  try {
    const client_id = req.user._id;
    const lawyer_id = req.body.lawyer_id;
    const {
      legal_title,
      case_facts,
      adverse_party,
      case_objectives,
      client_questions,
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
        case_files,
        lawyer_id,
      });

      newComplaint.save();

      // Find User Client and push Complaint
      const client_result = await User.findOne({
        _id: client_id,
        user_type: "client",
      });
      client_result.complaints.push(newComplaint);
      await client_result.save();

      // Find User Lawyer and push Complaint
      const lawyer_result = await User.findOne({
        _id: lawyer_id,
        user_type: "lawyer",
      });
      lawyer_result.complaints.push(newComplaint);
      await lawyer_result.save();

      req.flash("success_msg", "Complaint Successfully Processed");
      res.redirect("/dashboard");
    }
  } catch (err) {
    next(err);
  }
};

exports.findComplaintByID = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    const user_type = req.user.user_type;
    const complaint_id = req.params.id;

    const complaintResult = await Complaint.findById({
      _id: complaint_id,
    }).populate("solutions");
    const notifications = await Notification.find({ target: user_id });

    if (
      user_id === complaintResult.client_id ||
      user_id === complaintResult.lawyer_id
    ) {
      res.render("./complaint/complaint-view", {
        currentUser: req.user,
        result: complaintResult,
        user_type: user_type,
        notifications,
        solutions: complaintResult.solutions,
        CaseStatusesEnum,
      });
    } else {
      throw new Error("You do not have the authority to view this complaint");
    }
  } catch (err) {
    next(err);
  }
};

exports.getComplaintDetails = async (req, res, next) => {
  try {
    const complaint_id = req.params.id;
    const result = await Complaint.findById({ _id: complaint_id });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.patchComplaintDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    const files = req.files ? req.files.case_files : "";
    const {
      legal_title,
      case_facts,
      adverse_party,
      case_objectives,
      client_questions,
    } = req.body;

    let case_files = [];
    let errors = [];

    if (
      !legal_title ||
      !case_facts ||
      !adverse_party ||
      !case_objectives ||
      !client_questions ||
      !files
    )
      errors.push("There are missing fields");

    if (errors.length > 0)
      req.flash("error_msg", "There are some missing fields");
    else {
      const complaintResult = await Complaint.findById(id);
      const fileNames = complaintResult.case_files;
      // Uploading File
      if (Array.isArray(files)) {
        for (let index = 0; index < files.length; index++) {
          let case_file =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            files[index].name;
          case_files.push(case_file);
          files[index].mv("./public/uploads/evidences/" + case_file);
        }
      } else {
        let case_file =
          Date.now() + "-" + Math.round(Math.random() * 1e9) + files.name;
        case_files.push(case_file);
        files.mv("./public/uploads/evidences/" + case_file);
      }

      const path = "./public/uploads/evidences/";

      if (fileNames) {
        fileNames.forEach((element) => {
          if (fs.existsSync(path + element)) {
            fs.unlink(path + element, (err) => {
              if (err) {
                next(err);
              }
            });
          }
        });
      }

      await Complaint.findByIdAndUpdate(
        { _id: id },
        {
          legal_title: legal_title,
          case_facts: case_facts,
          adverse_party: adverse_party,
          case_objectives: case_objectives,
          client_questions: client_questions,
          case_files: case_files,
        }
      );
      // SET NEW ARRAY FILES
      await Complaint.findByIdAndUpdate(
        { _id: id },
        { $set: { case_files: case_files } }
      );
      req.flash("success_msg", "Succesfully edited complaint form");
    }
    res.redirect("/form/complaints/" + id);
  } catch (err) {
    next(err);
  }
};

exports.acceptComplaintPending = async (req, res, next) => {
  try {
    const filter = req.body.id;
    const { appointment_date, meeting_link } = req.body;
    let error = false;

    // DATE VARIABLES FOR COMPARISON
    const myDate = new Date(appointment_date);
    const todayDate = new Date(Date.now());

    if (myDate.getTime() >= todayDate) {
      const complaintResult = await Complaint.findOneAndUpdate(
        { _id: filter },
        {
          case_status: CaseStatusesEnum.BOOKED,
          appointment_date: appointment_date,
          meeting_link: meeting_link,
        }
      );

      const lawyerDeets = await User.findOne({
        _id: complaintResult.lawyer_id,
      });
      const clientDeets = await User.findOne({
        _id: complaintResult.client_id,
      });

      const link = "http://" + req.get("host");
      const title = `Your consultation request ${complaintResult.legal_title} has been approved!`;
      const msg = `<h1>Hello ${clientDeets.user_fname},</h1><br> Your consultation request with lawyer ${lawyerDeets.user_fname} has been approved.<br><a href=${link}>Click here to visit website</a>`;
      sendMail(clientDeets.email, title, msg);

      const pushNotify = new Notification({
        complaint_id: complaintResult._id,
        message: "has accepted your consultation request",
        actor: lawyerDeets.username,
        target: complaintResult.client_id,
      });

      await pushNotify.save();
    } else {
      error = true;
      req.flash("error_msg", "Date should be now or later");
    }

    if (!error)
      req.flash("success_msg", `Succesfully accepted case with id: ${filter}`);
    res.redirect("/form/complaints/" + filter);
  } catch (err) {
    next(err);
  }
};

exports.rejectComplaintPending = async (req, res, next) => {
  try {
    const filter = req.body.id;
    complaintResult = await Complaint.findOneAndUpdate(
      { _id: filter },
      {
        case_status: CaseStatusesEnum.REJECTED,
        complaint_status: ComplaintStatusesEnum.REJECTED,
        is_verified: true,
      }
    );

    res.redirect("/admin/pending");
  } catch (err) {
    next(err);
  }
};

exports.completeComplaintOngoing = async (req, res, next) => {
  try {
    const id = req.body.id;
    await Complaint.findByIdAndUpdate(
      { _id: id },
      {
        case_status: CaseStatusesEnum.COMPLETED,
        complaint_status: ComplaintStatusesEnum.RESOLVED,
      }
    );

    res.redirect("/form/complaints/" + req.body.id);
  } catch (err) {
    next(err);
  }
};

exports.followUpSchedule = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Complaint.findByIdAndUpdate(
      { _id: id },
      {
        complaint_status: ComplaintStatusesEnum.FOLLOWUP,
        case_status: CaseStatusesEnum.PENDING,
        $unset: { appointment_date: "", meeting_link: "" },
      }
    );
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};

exports.getReferView = async (req, res, next) => {
  try {
    const todayDate = new Date();
    const available_lawyers = await User.find({
      user_type: "lawyer",
      "availability.start_date": { $lte: todayDate },
      "availability.end_date": { $gte: todayDate },
    });

    res.json(available_lawyers);
  } catch (err) {
    next(err);
  }
};

exports.patchReferUpdate = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    const { lawyer_id, complaint_id } = req.body;

    const complaintDeets = await Complaint.findByIdAndUpdate(
      { _id: complaint_id },
      { lawyer_id: lawyer_id }
    );

    const lawyerDeets = await User.findByIdAndUpdate(
      { _id: user_id },
      { $pull: { complaints: complaint_id } }
    );

    await User.findByIdAndUpdate(
      { _id: lawyer_id },
      { $push: { complaints: complaint_id } }
    );

    // Push notification
    const pushNotify = new Notification({
      complaint_id: complaint_id,
      message: "has referred you to another lawyer",
      actor: lawyerDeets.username,
      target: complaintDeets.client_id,
    });

    await pushNotify.save();

    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
};
