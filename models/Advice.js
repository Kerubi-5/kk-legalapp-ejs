const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

const AdviceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid()
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
  legal_description: {
    type: String,
  },
  is_resolved: {
    type: Boolean,
    default: false,
  },
  lawyers: [
    {
      _id: {
        type: String,
        ref: "User",
      },
      answer: {
        type: String,
      },
      date_submitted: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

module.exports = mongoose.model("Advice", AdviceSchema);
