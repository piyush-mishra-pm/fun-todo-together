const express = require('express');
const taskRouter = new express.Router();
const taskController = require('../controllers/task');
const authMiddleware = require('../middlewares/auth');

taskRouter.post('/task', authMiddleware , taskController.createTask);
taskRouter.get('/tasks', authMiddleware, taskController.getSelectedTasks);
taskRouter.get('/task/:id', authMiddleware , taskController.getTask);
taskRouter.patch('/task/:id', authMiddleware ,taskController.updateTask);
taskRouter.delete('/task/:id', authMiddleware , taskController.deleteTask);

module.exports = taskRouter;