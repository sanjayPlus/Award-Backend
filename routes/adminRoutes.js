const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const multer = require("multer");
const path = require("path");
const carouselStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/carouselImage");
    },
    filename: function (req, file, cb) {
      // It is the filename that is given to the saved file.
      const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
         cb(null, `${uniqueSuffix}${ext}`);
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
  //gallery
  const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // destination is used to specify the path of the directory in which the files have to be stored
        cb(null, "./public/galleryImage");
      },
      filename: function (req, file, cb) {
        // It is the filename that is given to the saved file.
        const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
         cb(null, `${uniqueSuffix}${ext}`);
        // console.log(file);
      },
  })
  const galleryImage = multer({
    storage: galleryStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
   },
  });
 //adsgallery
  const adsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // destination is used to specify the path of the directory in which the files have to be stored
        cb(null, "./public/adsImage");
      },
      filename: function (req, file, cb) {
        // It is the filename that is given to the saved file.
        const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
         cb(null, `${uniqueSuffix}${ext}`);
        // console.log(file);
      },
  })
  const adsImage = multer({
    storage: adsStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });
  //offers
  const offerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // destination is used to specify the path of the directory in which the files have to be stored
        cb(null, "./public/offerImage");
      },
      filename: function (req, file, cb) {
        // It is the filename that is given to the saved file.
        const uniqueSuffix =Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
         cb(null, `${uniqueSuffix}${ext}`);
        // console.log(file);
      },
  })
  const offerImage = multer({
    storage: offerStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });

router.get('/protected', adminAuth,adminController.protected);
router.get('/user-details/:id',adminAuth, adminController.getUser);
router.get('/users',adminAuth, adminController.getAllUsers);
router.get('/carousel',adminController.getCarousel);
router.get('/gallery',adminController.getGallery);
router.get('/ads',adminController.getAds);
router.get('/offers',adminController.getOffer);

router.post('/login', adminController.adminLogin);
router.post('/register', adminController.adminRegister);
//carousel
router.post('/carosuel',adminAuth, carouselImage.single("image"), adminController.addCarouselImage);
router.post('/delete-carousel',adminAuth, adminController.deleteCarousel);
//gallery
router.post('/gallery',adminAuth,galleryImage.single("image"), adminController.addGalleryImage);
router.post('/delete-gallery',adminAuth, adminController.deleteGallery);
//ads
router.post('/add-ads',adminAuth,adsImage.single("image"), adminController.addAdsImage);
router.post('/delete-ads',adminAuth, adminController.deleteAds);
//offers
router.post('/add-offer',adminAuth,offerImage.single("image"), adminController.addOfferImage);
router.post('/delete-offer',adminAuth, adminController.deleteOffer);

router.delete('/delete-user/:id',adminAuth, adminController.deleteUser);

module.exports = router;