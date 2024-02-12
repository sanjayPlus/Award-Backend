// ReasonModel.js

const mongoose = require('mongoose');

const reasonSchema = new mongoose.Schema({
  reason: {
    type: String,
  },
  userId: {
    type: String,
  }
});

const Reason = mongoose.model('Reason', reasonSchema);
module.exports = Reason;
