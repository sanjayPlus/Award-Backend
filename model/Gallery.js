// GalleryModel.js

const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
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

const Gallery = mongoose.model('Gallery', GallerySchema);
module.exports = Gallery;