const express = require('express');
const taskRouter = new express.Router();
const taskController = require('../controllers/task');

taskRouter.get('/task', taskController.getTask);

module.exports = taskRouter;