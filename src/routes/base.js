const express = require('express');
const baseRouter = express.Router();

const baseController = require('../controllers/base');
const authMiddleware = require('../middlewares/auth');

baseRouter.get('/', authMiddleware.allowOnlyAuthenticated, baseController.getHomePage);

module.exports = baseRouter;
