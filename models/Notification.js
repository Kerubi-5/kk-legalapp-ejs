const mongoose = require("mongoose");
const nanoid = require("../utils/nanoid");

const NotificationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  complaint_id: {
    type: String,
    ref: "Complaint",
  },
  message: {
    type: String,
  },
  actor: {
    type: String,
  },
  target: {
    type: String,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  is_seen: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
