const mongoose = require('mongoose')

const ComplaintSchema = new mongoose.Schema({
    client_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    },
    date: {
        type: Date,
        default: Date.now
    },
    parent_name: {
        type: String
    },
    parent_address: {
        type: String
    },
    service_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Service"
    },
    files_and_attachments: [{
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