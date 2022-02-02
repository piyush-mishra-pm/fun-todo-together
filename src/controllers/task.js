const Task = require('../models/task');

const createTask = async (req, res, next) => {
    const task = new Task(req.body);
    try {
        await task.save();
        return res.status(201).send({
            task,
            message: 'Created a task',
        });
    } catch (e) {
        return res.status(400).send({
            task,
            message: `Error occurred while creating the task: ${e}`,
        });
    }
};

const getTask = async (req, res, next) => {
    try {
        console.log(req.params.id);
        const taskFound = await Task.findOne({ _id: req.params.id });
        if (!taskFound)
            return res
                .status(404)
                .send({ message: 'Could not find the resquested task' });

        return res.send(taskFound);
    } catch (e) {
        return res
            .status(500)
            .send({ message: `Error occurred while fetching the task: ${e}` });
    }
};

const updateTask = async (req, res, next) => {
    // Check if all the updates which are asked to do, are even allowed:
    const updatesAskedToDo = Object.keys(req.body);
    const allowedUpdates = ['heading', 'detail', 'done'];
    const canUpdate = updatesAskedToDo.every(update =>
        allowedUpdates.includes(update)
    );

    if (!canUpdate){
        return res.status(400).send({
            message: 'Update is not allowed on all the requested attributes.',
        });
    }

    try {
        const taskFound = await Task.findOne({ _id: req.params.id });

        if (!taskFound){
            return res
                .status(404)
                .send({
                    message:
                        'Could not find the task and hence will not update the task.',
                });
        }

        updatesAskedToDo.forEach(
            update => (taskFound[update] = req.body[update])
        );

        await taskFound.save();
        return res.send({ taskFound, message: 'Requested Update finished.' });
    } catch (e) {
        return res
            .status(500)
            .send({ message: `Error occurred while updating the task: ${e}` });
    }
};

const deleteTask = async (req, res, next) => {
    try {
        const taskFound = await Task.findOneAndDelete({ _id: req.params.id });

        if (!taskFound) {
            return res.status(404).send({ message: 'Could not find the task' });
        }

        return res.send({ taskFound, message: 'Deleted the requested task' });
    } catch (e) {
        return res.status(500).send({
            message: `Error occurred while deleting the task: ${e}`,
        });
    }
};

module.exports = {
    createTask,
    getTask,
    updateTask,
    deleteTask,
};
