const express = require('express');
const taskRouter = new express.Router();
const taskController = require('../controllers/task');
const tagController = require('../controllers/tag');
const authMiddleware = require('../middlewares/auth');

taskRouter.post('/task', authMiddleware.allowOnlyAuthenticated , taskController.createTask);
taskRouter.get('/tasks', authMiddleware.allowOnlyAuthenticated, taskController.getSelectedTasks);
taskRouter.get('/task/:id', authMiddleware.allowOnlyAuthenticated , taskController.getTask);
taskRouter.patch('/task/:id', authMiddleware.allowOnlyAuthenticated ,taskController.updateTask);
taskRouter.delete('/task/:id', authMiddleware.allowOnlyAuthenticated , taskController.deleteTask);

// Routes related to tags on the task (Find tags for a task, Add tags for a task and Remove tags from the task)
// Get all the tags for a task:
taskRouter.get('/task/:taskid/tags', authMiddleware.allowOnlyAuthenticated , tagController.getTagsForTask);
// Add a tag to a task:
taskRouter.post('/task/:taskid/tags/:tagid', authMiddleware.allowOnlyAuthenticated , tagController.addTagToTask);
// Remove a tag from a task:
taskRouter.delete('/task/:taskid/tags/:tagid', authMiddleware.allowOnlyAuthenticated , tagController.removeTagFromTask);

module.exports = taskRouter;