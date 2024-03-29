const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default:``
    },
    address:{
        type: String,
    },
    phone:{
        type: String,
    },
    aadhaar:{
        type: String,
    },
    blood_group:{
        type: String,
    },
    otp:{
        type: String, 
    },
    otpExpiry: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    forgotOTP:{
        type: String, 
    },
    forgotOTPExpiry: Date,
    date: {
        type: Date,
        default: Date.now
    },
    place : {
        type: String,
    },
    district : {
        type: String,
    },
    payments:[{
    paymentId:String,
    amount:Number,
    date:String,
    merchantId:String,
    merchantTransactionId:String,
  }]
})

const User = mongoose.model('User', userSchema);

module.exports = User;