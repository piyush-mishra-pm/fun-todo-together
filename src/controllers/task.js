const Task = require('../models/task');
const User = require('../models/user');

const debugEnabled = true;

const createTask = async (req, res, next) => {
    if(debugEnabled) console.log('Task Creation Asked', req.body);
    const task = new Task({
        ...req.body, 
        creator: req.user.id
    });

    try {
        await task.save();
        return res.status(201).send({
            status: 'ok',
            task,
            message: 'Created a task',
        });
    } catch (e) {
        return res.status(400).send({
            status:'error',
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
                .send({ status:'error', message: 'Could not find the resquested task' });

        return res.send({status:'ok', taskFound});
    } catch (e) {
        return res
            .status(500)
            .send({ status:'error', message: `Error occurred while fetching the task: ${e}` });
    }
};

// Gets a selection of task after filtering by query params, as follows:
// FILTERING: GET /tasks?done=true (else done=false)
// PAGINATION: GET /tasks?limit=10&page=1
// SORTING: GET /tasks?sortBy=createdAt:desc
// add check for both options (true//false; asc desc; )
const getSelectedTasks = async (req,res,next)=>{
    if (debugEnabled) console.log('requested to select tasks,',req.query);
    // Filtering todos which are 'done'.
    const match ={};
    if(req.query.done){
        match.done = req.query.done === 'true';
    }

    // Sorting by createdAt: (or even other possible attributes).
    const sort = {};
    if (req.query.sortBy) {
        const sortQuery = req.query.sortBy.split(':');
        if(sortQuery[1] === 'desc' ) sort[sortQuery[0]] = -1;
        if(sortQuery[1] === 'asc') sort[sortQuery[0]] = +1;
    }

    console.log(sort);
    console.log(sort.createdAt);

    // Pagination of TODDOs
    const currentPage = Number(req.query.page) || 1;
    const limitPerPage = Number(req.query.limit) || 5;
    const skip = limitPerPage * (currentPage - 1);

    try {
        let totalCount
        
        if(match.done!=undefined) {
            totalCount = await Task.find({
                creator: req.user._id,
                done: match.done,
            }).count();
        }
        else totalCount = await Task.find({
            creator: req.user._id
        }).count();

        console.log(totalCount);

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
        return res.render('tasks/tasksPage', {
            tags: [
                { _id: 1, name: 'work' },
                { _id: 2, name: 'hobby' },
            ],
            tasks: req.user.tasks,
            query: req.query,
            match,
            sort,
            currentPage,
            totalPages: Math.ceil(totalCount / limitPerPage),
            totalCount,
        });
    } catch (e) {
        return res.status(500).send({message:`Error occurred while fetching tasks. ${e}`});
    }
}

const updateTask = async (req, res, next) => {
    // Check if all the updates which are asked to do, are even allowed:
    if(debugEnabled) console.log('requested to update a task',req.body);
    const updatesAskedToDo = Object.keys(req.body);
    const allowedUpdates = ['heading', 'detail', 'done'];
    const canUpdate = updatesAskedToDo.every(update =>
        allowedUpdates.includes(update)
    );

    if (!canUpdate){
        return res.status(400).send({
            status:'error',
            message: 'Update is not allowed on all the requested attributes.',
        });
    }

    try {
        // Fetches a task only if the task id present in taskDB and also its creator is the user making request.
        if (debugEnabled) console.log('extracting params', req.params.id);
        const taskFound = await Task.findOne({ _id: req.params.id, creator: req.user._id });

        if (!taskFound){
            return res.status(404).send({
                status: 'error',
                message:
                    'Could not find the task and hence will not update the task.',
            });
        }

        updatesAskedToDo.forEach(
            update => (taskFound[update] = req.body[update])
        );

        await taskFound.save();
        return res.send({ status:'ok', taskFound, message: 'Requested Update finished.' });
    } catch (e) {
        return res
            .status(500)
            .send({ status:'error', message: `Error occurred while updating the task: ${e}` });
    }
};

const deleteTask = async (req, res, next) => {
    if (debugEnabled) console.log('requested to delete task, ', req.params);
    try {
        const taskFound = await Task.findOneAndDelete({ _id: req.params.id, creator: req.user._id });

        if (!taskFound) {
            return res.status(404).send({ status:'error', message: 'Could not find the task' });
        }

        return res.send({ status:'ok', taskFound, message: 'Deleted the requested task' });
    } catch (e) {
        return res.status(500).send({
            status:'error',
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
