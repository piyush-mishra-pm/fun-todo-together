const express = require('express');
const chatRouter = new express.Router();
const chatController = require('../controllers/chat');
const authMiddleware = require('../middlewares/auth');

chatRouter.get('/chat', authMiddleware.allowOnlyAuthenticated , chatController.getChatPage);

module.exports = chatRouter;