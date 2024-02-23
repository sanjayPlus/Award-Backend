const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
     jobrole:{
        type:String
     },
     description:{
        type:String,
    },
    location:{
        type:String
    },
    package:{
        type:String
    },
    phone:{
        type:String
    },
    address:{
        type:String
    },
    image:{
        type:String
    }
});

const Career = mongoose.model('Career', CareerSchema);
module.exports = Career;