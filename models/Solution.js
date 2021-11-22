const mongoose = require("mongoose");
const nanoid = require("../utils/nanoid");

const SolutionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  complaint_id: {
    type: String,
    ref: "Complaint",
  },
  video_link: {
    type: String,
  },
  summary: {
    type: String,
  },
  recommendations: {
    type: String,
  },
  date_completed: {
    type: Date,
    default: Date.now(),
  },
  re_appointment: {
    type: Date,
  },
  supporting_document: {
    type: String,
  },
});

module.exports = mongoose.model("Solution", SolutionSchema);
