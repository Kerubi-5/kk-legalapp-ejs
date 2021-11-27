const mongoose = require("mongoose");
const nanoid = require("../utils/nanoid");
const CaseStatusesEnum = require("../controllers/EnumTypes/CaseStatusesEnum")
const ComplaintStatusesEnum = require("../controllers/EnumTypes/ComplaintStatusesEnum");

const ComplaintSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  client_id: {
    type: String,
    ref: "User",
  },
  date_submitted: {
    type: Date,
    default: Date.now(),
  },
  legal_title: {
    type: String,
  },
  case_facts: {
    type: String,
  },
  adverse_party: {
    type: String,
  },
  case_objectives: {
    type: String,
  },
  client_questions: {
    type: String,
  },
  case_files: [
    {
      type: String,
    },
  ],
  case_status: {
    type: String,
    default: CaseStatusesEnum.PENDING
  },
  complaint_status: {
    type: String,
    default: ComplaintStatusesEnum.PENDING
  },
  lawyer_id: {
    type: String,
    ref: "User",
  },
  appointment_date: {
    type: Date,
  },
  meeting_link: {
    type: String,
  },
  solutions: [
    {
      type: String,
      ref: "Solution",
    },
  ],
  is_verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
