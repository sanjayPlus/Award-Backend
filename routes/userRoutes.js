const router = require('express').Router();

const userAuth = require('../middleware/userAuth');
const userController = require('../controllers/userController');

//Get
router.get('/protected',userAuth, userController.protected);
router.get('/details',userAuth, userController.details);

//Post
router.post('/register',userController.register)
router.post('/login',userController.login);
router.post('/update-user',userAuth, userController.updateUser);
router.post('/sentotp', userController.sentOTP);
router.post('/verifyotp', userController.verifyOTP);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-password', userController.verifyForgotPassword);
router.delete('/delete-user',userAuth, userController.deleteUser);


module.exports = router;