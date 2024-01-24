const mongoose = require("mongoose");
const notificationListSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    image:{
       type:String,   
    },
    url:{
        type:String,
    },
    date:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
});
const NotificationList = mongoose.model("notificationList",notificationListSchema);
module.exports = NotificationList;