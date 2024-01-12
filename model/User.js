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
    avatar: {
        type: String,
        default:`${process.env.DOMAIN}/images/avatar.png`
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
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;