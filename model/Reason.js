// ReasonModel.js

const mongoose = require('mongoose');

const reasonSchema = new mongoose.Schema({
  reason: {
    type: String,
  },
  userId: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const Reason = mongoose.model('Reason', reasonSchema);
module.exports = Reason;
