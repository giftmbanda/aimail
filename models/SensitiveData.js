const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SensitiveDataSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    sensitiveData: {
        type: [String],  // Array of strings to hold multiple pieces of sensitive data
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('SensitiveData', SensitiveDataSchema);
