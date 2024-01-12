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

router.delete('/delete-user',userAuth, userController.deleteUser);


module.exports = router;