const mongoose = require('mongoose')
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

const ComplaintSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid()
    },
    client_id: {
        type: String,
        ref: "User"
    },
    date_submitted: {
        type: Date,
        default: Date.now()
    },
    legal_title: {
        type: String
    },
    case_facts: {
        type: String
    },
    adverse_party: {
        type: String
    },
    case_objectives: {
        type: String
    },
    client_questions: {
        type: String
    },
    case_files: [{
        type: String
    }],
    case_status: {
        type: String,
        default: "pending"
    },
    lawyer_id: {
        type: String,
        ref: "User"
    },
    appointment_date: {
        type: Date
    },
    solutions: [{
        type: String,
        ref: "Solution"
    }]
})

module.exports = mongoose.model('Complaint', ComplaintSchema)