const express = require('express');
const authRouter = express.Router();

const authController = require('../controllers/auth');

authRouter.get('/signup', authController.getSignUpPage);
authRouter.get('/login', authController.getLoginPage);

module.exports = authRouter;