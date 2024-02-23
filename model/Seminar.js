const mongoose = require('mongoose');

const SeminarSchema = new mongoose.Schema({
  subject: {
    type: String,
  },
    description:{
        type:String,
    },
    date:{
        type:String,
    },
    location:{
        type:String,
    },
    photo:{
        type:String,
    },
    link:{
        type:String,
    },
    seminarType:{
        type:String,
    }
});

const Seminar = mongoose.model('Seminar', SeminarSchema );
module.exports = Seminar;