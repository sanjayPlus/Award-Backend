const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
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

const Offer = mongoose.model('Offer', OfferSchema);
module.exports = Offer;