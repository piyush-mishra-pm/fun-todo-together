const Task = require('../models/task');

const createTask = async (req, res, next) => {
    const task = new Task({
        ...req.body, 
        creator: req.user.id
    });

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

// Gets a task by the task ID:
const getTask = async (req, res, next) => {
    const taskId = req.params.id;
    try {
        const taskFound = await Task.findOne({ _id: taskId });
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

// Gets a selection of task after filtering by query params, as follows:
// FILTERING: GET /task?done=true (else done=false)
// PAGINATION: GET /task?limit=10&page=1
// SORTING: GET /task?sortBy=createdAt:desc
const getSelectedTasks = async (req,res,next)=>{
    console.log('requested tasks');
    // Filtering todos which are 'done'.
    const match ={};
    if(req.query.done){
        match.done = req.query.done === 'true';
    }

    // Sorting by createdAt: (or even other possible attributes).
    const sort = {};
    if (req.query.sortBy) {
        const sortQuery = req.query.sortBy.split(':');
        sort[sortQuery[0]] = sortQuery[1] === 'desc' ? -1 : 1;
    }

    // Pagination of TODDOs
    const currentPage = Number(req.query.page) || 1;
    const limitPerPage = Number(req.query.limit) || 4;
    const skip = limitPerPage * (currentPage - 1);

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(limitPerPage),
                skip: parseInt(skip),
                sort,
            },
        });
        //res.send({tasks:req.user.tasks, message: 'Successfully fetched Tasks!'});
        //console.log(req.user.tasks);
        //return res.render('tasks/tasksPage',{tasks:req.user.tasks});
        //return res.status(200).send({tasks:req.user.tasks, message: 'Successfully fetched Tasks!'});
        return res.render('tasks/tasksPage',{ tasks: req.user.tasks });
    } catch (e) {
        return res.status(500).send({message:`Error occurred while fetching tasks. ${e}`});
    }
}

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
        // Fetches a task only if the task id present in taskDB and also its creator is the user making request.
        const taskFound = await Task.findOne({ _id: req.params.id, creator: req.user._id });

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
        const taskFound = await Task.findOneAndDelete({ _id: req.params.id, creator: req.user._id });

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
    getSelectedTasks,
    updateTask,
    deleteTask,
};
