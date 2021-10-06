const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    message: {
        type: String
    },
    actor: {
        type: String
    },
    target: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User"
    },
    date: {
        type: Date,
        default: Date.now()
    },
    is_seen: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Notification', NotificationSchema)