const express = require('express');
const taskRouter = new express.Router();
const taskController = require('../controllers/task');

taskRouter.post('/task', taskController.createTask);
taskRouter.get('/task/:id', taskController.getTask);
taskRouter.patch('/task/:id', taskController.updateTask);
taskRouter.delete('/task/:id', taskController.deleteTask);

module.exports = taskRouter;