const express = require('express');
const entertainmentRouter = new express.Router();
const entertainmentController = require('../controllers/entertainment');
const authMiddleware = require('../middlewares/auth');

entertainmentRouter.get('/entertainment', authMiddleware.allowOnlyAuthenticated , entertainmentController.getEntertainmentPage);

module.exports = entertainmentRouter;