const express = require('express');
const userRouter = new express.Router();
const userController = require('../controllers/user');

userRouter.get('/user', userController.getUser);

module.exports = userRouter;