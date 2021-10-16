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
    is_resolved: {
        type: Boolean,
        default: false
    },
    lawyers: [{
        _id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User"
        },
        answer: {
            type: String
        },
        is_resolved: {
            type: Boolean,
            default: false
        },
        date_submitted: {
            type: Date,
            default: Date.now()
        }
    }]
})

module.exports = mongoose.model('Advice', AdviceSchema)