const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/protected', adminAuth,adminController.protected);
router.get('/user-details/:id',adminAuth, adminController.getUser);
router.get('/users',adminAuth, adminController.getAllUsers);

router.post('/login', adminController.adminLogin);
router.post('/register', adminController.adminRegister);


module.exports = router;