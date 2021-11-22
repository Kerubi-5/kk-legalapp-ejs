const mongoose = require("mongoose");
const nanoid = require("../utils/nanoid");

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  user_fname: {
    type: String,
    required: true,
  },
  user_lname: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
  permanent_address: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
  },
  // Lawyer Related Fields
  lawyer_credential: {
    type: String,
  },
  // Hide information
  is_public: {
    type: Boolean,
    default: false,
  },
  availability: {
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  verified_lawyer: {
    type: Boolean,
  },
  complaints: [
    {
      type: String,
      ref: "Complaint",
    },
  ],
  date_created: {
    type: Date,
    default: Date.now(),
  },
  avatar: {
    type: String,
    default: "unknown.jpg",
  },
  background: [
    {
      organization: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
