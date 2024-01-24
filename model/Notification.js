const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
    token:{
        type:String
    },
    user_ID:{
       type:String   
    },
});
const Notification = mongoose.model("notification",notificationSchema);
module.exports = Notification;