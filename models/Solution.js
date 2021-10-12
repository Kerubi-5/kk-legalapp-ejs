const mongoose = require('mongoose')

const SolutionSchema = new mongoose.Schema({
    complaint_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Complaint"
    },
    video_link: {
        type: String
    },
    summary: {
        type: String
    },
    recommendations: {
        type: String
    },
    date_completed: {
        type: Date,
        default: Date.now()
    },
})

module.exports = mongoose.model('Solution', SolutionSchema)