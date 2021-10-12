const mongoose = require('mongoose')

const ComplaintSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.SchemaTypes.ObjectId,
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
    case_file: {
        type: String
    },
    case_status: {
        type: String,
        default: "pending"
    },
    lawyer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    },
    appointment_date: {
        type: Date
    },
    solutions_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Solution"
    }
})

module.exports = mongoose.model('Complaint', ComplaintSchema)