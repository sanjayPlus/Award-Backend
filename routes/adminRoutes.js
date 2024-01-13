const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const multer = require("multer");

const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/carouselImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
      console.log(`${uniqueSuffix}-${file.originalname}`);
      // console.log(file);
    },
  });
  
  // Configure storage engine instead of dest object.
  const carouselImage = multer({
    storage: carouselStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
  const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // destination is used to specify the path of the directory in which the files have to be stored
        cb(null, "./public/galleryImage");
      },
      filename: function (req, file, cb) {
        // It is the filename that is given to the saved file.
        const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}`);
        console.log(`${uniqueSuffix}-${file.originalname}`);
        // console.log(file);
      },
  })
  const galleryImage = multer({
    storage: galleryStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
router.get('/protected', adminAuth,adminController.protected);
router.get('/user-details/:id',adminAuth, adminController.getUser);
router.get('/users',adminAuth, adminController.getAllUsers);
router.get('/carousel',adminController.getCarousel)
router.get('/gallery',adminController.getGallery);


router.post('/login', adminController.adminLogin);
router.post('/register', adminController.adminRegister);
router.post('/carosuel', carouselImage.single("image"), adminController.addCarouselImage);
router.post('/delete-carousel', adminController.deleteCarousel);
//gallery
router.post('/gallery',galleryImage.single("image"), adminController.addGalleryImage);
router.post('/delete-gallery', adminController.deleteGallery);


module.exports = router;