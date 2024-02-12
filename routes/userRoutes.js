const router = require('express').Router();
const multer = require("multer");
const userAuth = require('../middleware/userAuth');
const userController = require('../controllers/userController');

const CardStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // destination is used to specify the path of the directory in which the files have to be stored
      cb(null, "./public/cardImage");
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
  const CardImage = multer({
    storage: CardStorage,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
  });

const ProfileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // destination is used to specify the path of the directory in which the files have to be stored
        cb(null, "./public/profileImage");
    },
    filename: function (req, file, cb) {
        // It is the filename that is given to the saved file.
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
        console.log(`${uniqueSuffix}-${file.originalname}`);
        // console.log(file);
    },
});

// Configure storage engine instead of dest object.
const ProfileImage = multer({
    storage: ProfileStorage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
});


//Get
router.get('/protected', userAuth, userController.protected);
router.get('/details', userAuth, userController.details);
router.get('/bloodDonationSearch', userController.bloodDonation1);
router.get('/bloodDonationSearch2', userController.bloodDonation2);

//Post
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/update-user', userAuth, userController.updateUser);
router.post('/sentotp', userController.sentOTP);
router.post('/verifyotp', userController.verifyOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-password', userController.verifyForgotPassword);
router.post('/google-login', userController.googleLogin);//googleLogin
router.post('/apple-login', userController.appleLogin);
router.post('/auto-login', userAuth, userController.autoLogin);
router.post('/add-notification-token', userAuth, userController.storeNotificationToken);
router.post('/feedback', userAuth, userController.feedback);
router.post('/create-id-card', CardImage.single('profileImage'), userAuth, userController.createIdCard);

//delete
router.delete('/delete-user', userAuth, userController.deleteUser);


module.exports = router;