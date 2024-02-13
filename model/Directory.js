// directoryModel.js

const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  category: {
    type: String,
  }
});

const Directory = mongoose.model('Directory', directorySchema);
module.exports = Directory;
