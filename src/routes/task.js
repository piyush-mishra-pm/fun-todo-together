const express = require('express');
const taskRouter = new express.Router();
const taskController = require('../controllers/task');
const authMiddleware = require('../middlewares/auth');

taskRouter.post('/task', authMiddleware.allowOnlyAuthenticated , taskController.createTask);
taskRouter.get('/tasks', authMiddleware.allowOnlyAuthenticated, taskController.getSelectedTasks);
taskRouter.get('/task/:id', authMiddleware.allowOnlyAuthenticated , taskController.getTask);
taskRouter.patch('/task/:id', authMiddleware.allowOnlyAuthenticated ,taskController.updateTask);
taskRouter.delete('/task/:id', authMiddleware.allowOnlyAuthenticated , taskController.deleteTask);

module.exports = taskRouter;