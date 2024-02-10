//calendermodel.js
const mongoose = require('mongoose');

const CalenderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    image: {
        type:String,
    },
    date: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Calender = mongoose.model('calender', CalenderSchema);
module.exports = Calender;