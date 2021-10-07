const mongoose = require('mongoose')

const AdviceSchema = new mongoose.Schema({
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
    legal_description: {
        type: String
    },
    client_questions: {
        type: String
    },
    case_status: {
        type: String,
        default: "pending"
    },
    lawyer: [{
        _id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User"
        },
        answer: {
            type: String
        },
        is_right: {
            type: Boolean
        }
    }]
})

module.exports = mongoose.model('Advice', AdviceSchema)