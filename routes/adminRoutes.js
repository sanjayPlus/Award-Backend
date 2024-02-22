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
//OneImage
const OneStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/OneImage");
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
const OneImage = multer({
  storage: OneStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});
const calendarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/calendarImage");
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
const calendarImage = multer({
  storage: calendarStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});


const seminarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/seminarImage");
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
const seminarImage = multer({
  storage: seminarStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});

const quoteStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/quoteImage");
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
const quoteImage = multer({
  storage: quoteStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});



const careerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, "./public/careerImage");
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
const careerImage = multer({
  storage: careerStorage,
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
router.get('/calendar-events',adminController.getCalenderEvents);
router.get('/notifications',adminController.getNotifications);
router.get('/feedbacks',adminAuth,adminController.getFeedback);
router.get('/reasons',adminAuth,adminController.getReason);
router.get('/directory',adminController.getDirectory);
router.get('/get-seminar',adminController.getSeminar);
router.get('/daily-quote',adminController.getDailyQuote);
router.get('/career',adminController.getCareer)


router.post('/login', adminController.adminLogin);
// router.post('/register', adminController.adminRegister);
router.post('/carousel',adminAuth, carouselImage.single("image"), adminController.addCarouselImage);
router.post('/delete-carousel',adminAuth, adminController.deleteCarousel);
router.post('/gallery',adminAuth,galleryImage.single("image"), adminController.addGalleryImage);
router.post('/delete-gallery',adminAuth, adminController.deleteGallery);
router.post('/add-ads',adminAuth,adsImage.single("image"), adminController.addAdsImage);
router.post('/delete-ads',adminAuth, adminController.deleteAds);
router.post('/add-offer',adminAuth,offerImage.single("image"), adminController.addOfferImage);
router.post('/delete-offer',adminAuth, adminController.deleteOffer);
router.post('/add-calender-events',adminAuth, calendarImage.single("image"), adminController.addCalenderEvent);
router.post('/sent-notification',adminAuth,OneImage.single("image"), adminController.sentNotificationToAllUsers);
router.post('/add-directory',adminAuth, adminController.addDirectory);
router.post('/add-seminar',adminAuth, seminarImage.single("photo"), adminController.addSeminar);
router.post('/add-career',adminAuth,careerImage.single("image"), adminController.addCareer);
router.post('/add-quote',adminAuth, quoteImage.single("image"), adminController.addDailyQuote);

router.delete('/delete-user/:id',adminAuth, adminController.deleteUser);
router.delete('/delete-notification/:id',adminAuth, adminController.deleteNotification);
router.delete('/delete-calender-event/:id',adminAuth, adminController.deleteCalenderEvent);
router.delete('/delete-feedback/:id',adminAuth, adminController.deleteFeedback);
router.delete('/delete-reason/:id',adminAuth, adminController.deleteReason);
router.delete('/delete-directory/:id',adminAuth, adminController.deleteDirectory);
router.delete('/delete-seminar/:id',adminAuth, adminController.deleteSeminar);
router.delete('/delete-career/:id',adminAuth, adminController.deleteCareer);
router.delete('/delete-quote/:id',adminAuth, adminController.deleteDailyQuote);

module.exports = router;