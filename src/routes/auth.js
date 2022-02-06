const express = require('express');
const authRouter = express.Router();

const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

authRouter.get('/signup', authMiddleware.allowOnlyUnauthenticated ,authController.getSignUpPage);
authRouter.get('/login', authMiddleware.allowOnlyUnauthenticated, authController.getLoginPage);

module.exports = authRouter;