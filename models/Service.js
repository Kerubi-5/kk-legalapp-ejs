const mongoose = require('mongoose')

const ServiceSchema = new mongoose.Schema({
    service_type: {
        type: String
    },
    service_name: {
        type: String
    },
    service_name: {
        type: String
    },
})

module.exports = mongoose.model('Service', ServiceSchema)