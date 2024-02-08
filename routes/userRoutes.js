const router = require('express').Router();

const userAuth = require('../middleware/userAuth');
const userController = require('../controllers/userController');

//Get
router.get('/protected',userAuth, userController.protected);
router.get('/details',userAuth, userController.details);
router.get('/bloodDonationSearch',userController.bloodDonation1);
router.get('/bloodDonationSearch2',userController.bloodDonation2);

//Post
router.post('/register',userController.register);
router.post('/login',userController.login);
router.post('/update-user',userAuth, userController.updateUser);
router.post('/sentotp', userController.sentOTP);
router.post('/verifyotp', userController.verifyOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-password', userController.verifyForgotPassword);
router.post('/google-login',userController.googleLogin);//googleLogin
router.post('/apple-login',userController.appleLogin);
router.post('/auto-login',userAuth,userController.autoLogin);
router.post('/add-notification-token',userAuth,userController.storeNotificationToken);

//delete
router.delete('/delete-user',userAuth, userController.deleteUser);


module.exports = router;