const mongoose = require('mongoose');

const AdsSchema = new mongoose.Schema({
  image: {
    type: String,
  },
    href:{
        type:String,
    },
    name:{
        type:String,
    },
    description:{
        type:String,
    }
});

const Ads = mongoose.model('Ads', AdsSchema);
module.exports = Ads;