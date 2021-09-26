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
    service_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Service"
    },
    case_file: [{
        imageUrl: {
            type: String,
            required: true
        }
    }],
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
    date_completed: {
        type: Date
    }
})

module.exports = mongoose.model('Complaint', ComplaintSchema)