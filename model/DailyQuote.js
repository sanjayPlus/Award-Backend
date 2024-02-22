// DailyQuoteModel.js

const mongoose = require('mongoose');

const DailyQuoteSchema = new mongoose.Schema({
  image: {
    type: String,
  },
    href:{
        type:String,
        default:""
    },
    quote:{
        type:String,
    },
    date:{
        type:String,
    }
});

const DailyQuote = mongoose.model('DailyQuote', DailyQuoteSchema);
module.exports = DailyQuote;