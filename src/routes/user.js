const express = require('express');
const userRouter = new express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');

// Sign-Up:
userRouter.post('/user/signup', userController.createUser);
// Log-in
userRouter.post('/user/login', userController.logInUser);
// Log-out
userRouter.get('/user/logout', authMiddleware.allowOnlyAuthenticated, userController.logOutUser);
// Log-Out from all the devices: clear the list of valid tokens for all the devices.
userRouter.get('/user/logoutall', authMiddleware.allowOnlyAuthenticated, userController.logOutUserAllTokens);

userRouter.get('/user/', authMiddleware.allowOnlyAuthenticated, userController.getUser);
userRouter.patch('/user/', authMiddleware.allowOnlyAuthenticated, userController.updateUser);
userRouter.delete('/user/', authMiddleware.allowOnlyAuthenticated, userController.deleteUser);

module.exports = userRouter;