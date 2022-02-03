const express = require('express');
const userRouter = new express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');

// Sign-Up:
userRouter.post('/user', userController.createUser);
// Log-in
userRouter.post('/user/login', userController.logInUser);
// Log-out
userRouter.post('/user/logout', authMiddleware, userController.logOutUser);
// Log-Out from all the devices: clear the list of valid tokens for all the devices.
userRouter.post('/user/logoutall', authMiddleware, userController.logOutUserAllTokens);

userRouter.get('/user/', authMiddleware, userController.getUser);
userRouter.patch('/user/', authMiddleware, userController.updateUser);
userRouter.delete('/user/', authMiddleware, userController.deleteUser);

module.exports = userRouter;