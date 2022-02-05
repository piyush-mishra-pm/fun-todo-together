const express = require('express');
const baseRouter = express.Router();

const baseController = require('../controllers/base');

baseRouter.get('/', baseController.getHomePage);

module.exports = baseRouter;
