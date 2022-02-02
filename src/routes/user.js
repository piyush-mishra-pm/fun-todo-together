const express = require('express');
const userRouter = new express.Router();
const userController = require('../controllers/user');

userRouter.post('/user', userController.createUser);
userRouter.get('/user/:id', userController.getUser);
userRouter.patch('/user/:id', userController.updateUser);
userRouter.delete('/user/:id', userController.deleteUser);

module.exports = userRouter;