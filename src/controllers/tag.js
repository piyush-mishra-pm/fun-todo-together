const Task = require('../models/task');
const User = require('../models/user');

const debugEnabled = true;

const createTag = async (req, res, next) => {
    if (debugEnabled) console.log('Tag Creation Asked', req.body);

    // Tag already exists, so don't create a duplicate:
    const tagExistsOnLoggedInUser = await User.findOne({
        _id: req.user._id,
        'tags.name': req.body.name,
    });
    if(debugEnabled) console.log('present?', tagExistsOnLoggedInUser);
    if (tagExistsOnLoggedInUser)
        return res.status(400).send({
            status: 'error',
            message: `A tag already present with this name, Please choose a unique tagname.`,
        });

    try {
        // Tag unique and hence allowed to create:
        // So append the tag in tags array of user:
        req.user.tags = req.user.tags.concat({name:req.body.name});
        // Save the updated array of tags
        await req.user.save();
        if(debugEnabled) console.log('user?',req.user);
        return res.status(201).send({
            status: 'ok',
            tagname:req.body.name,
            message: 'Created a tag successfully.',
        });
    } catch (e) {
        return res.status(400).send({
            status: 'error',
            message: `Error occurred while creating the tag: ${e}.`,
        });
    }
};

const getTag =async (req, res, next) => {
    const tagid = req.params.tagid;
    if (debugEnabled) console.log('requested a tag for tagid:,', tagid);
    try {
        const tagFound = req.user.tags.filter(tag => tag._id.toString() == tagid);
        
        if (debugEnabled) console.log(tagFound);
        
        if(tagFound.length > 0) {
            return res.status(200).send({status:'ok', message:'fetched user tags successfully',tagFound});
        }

        return res.status(400).send({status:'error', message:'No such tag found',tagFound});

    } catch (e) {
        return res
            .status(500)
            .send({ status:'error', message: `Error occurred while fetching tags for user. ${e}` });
    }
}

const getTags = async (req, res, next) => {
    if (debugEnabled) console.log('requested tags,', req.query);

    try {
        const userTags = req.user.tags;
        
        if (debugEnabled) console.log(userTags);
        
        return res.status(200).send({status:'ok', message:'fetched user tags successfully',userTags});
    } catch (e) {
        return res
            .status(500)
            .send({ status:'error', message: `Error occurred while fetching tags for user. ${e}` });
    }
};

const updateTag = async (req, res, next) => {
    // Check if all the updates which are asked to do, are even allowed:
    if (debugEnabled) console.log('requested to update a task', req.body);
    const updatesAskedToDo = Object.keys(req.body);
    const allowedUpdates = ['name'];
    const canUpdate = updatesAskedToDo.every(update =>
        allowedUpdates.includes(update)
    );

    if(debugEnabled) console.log('canUpdate:',canUpdate);

    if (!canUpdate) {
        return res.status(400).send({
            status: 'error',
            message: 'Update is not allowed on all the requested attributes.',
        });
    }

    try {
        // Fetches a tag only if the tag id present in taskDB and also its creator is the user making request.
        if (debugEnabled) console.log('extracting params', req.params.id);
        const tagIndexFound = await req.user.tags.findIndex(tag => tag._id.toString() === req.params.id);

        if (tagIndexFound===-1) {
            return res.status(404).send({
                status: 'error',
                message:
                    'Could not find the task and hence will not update the task.',
            });
        }

        updatesAskedToDo.forEach(
            update => (req.user.tags[tagIndexFound][update] = req.body[update])
        );

        await req.user.save();
        return res.send({
            status: 'ok',
            tags:req.user.tags,
            message: 'Tag name updated successfully.',
        });
    } catch (e) {
        return res
            .status(500)
            .send({
                status: 'error',
                message: `Error occurred while updating the tag name: ${e}`,
            });
    }
};

// TODO: When removing the tag, then must remove the tag from all the tasks which use this tagid.
const deleteTag = async (req, res, next) => {
    if (debugEnabled) console.log('requested to delete tag, ', req.params);
    try {
        // Check if the tag doesn not exist:
        // Can find the tag using the tag-id and req.params.id:
        const tagIndexFound = req.user.tags.findIndex(
            tag => tag._id.toString() === req.params.id
        );
        if (tagIndexFound === -1) {
            return res.status(400).send({
                status: 'error',
                message: 'Tag does not exist with the user, so cannot delete the tag',
            });
        }

        // Tag does exist, so remove the tag from 2 places:
        // 1. from all the user's tasks which contain this tag, and
        // 2. from user's tags array.

        // 1. Removing the tag from all the user's tasks containing this tag:
        await Task.updateMany(
            // Find the tasks created by the user:
            { creator: req.user._id},

            // Delete the tag from the ueser's tasks:
            { $pull: { tags: req.params.id } }
        );

        // 2. Removing the tag from user's tag list:
        req.user.tags = await req.user.tags.filter(
            tag => tag._id.toString() !== req.params.id
        );
        
        // Save the updated list of tags (after removing the requested tag)
        // (after removing token for present device).
        await req.user.save();

        return res.send({
            status: 'ok',
            message: 'Deleted the requested tag',
            userTags:req.user.tags,
        });
    } catch (e) {
        return res.status(500).send({
            status: 'error',
            message: `Error occurred while deleting the tag: ${e}`,
        });
    }
};

const getTagsForTask = async (req, res, next) =>{
    if(debugEnabled) console.log('requested tags for the task-id:', req.params.taskid);
    const taskId = req.params.taskid;
    try{
        // Check if even any task exists with requested task id and the userId.
        // User can only fetch tasks created by him, and can't access tasks created by other users.
        const taskFound = await Task.findById({ _id: taskId.toString() , creator: req.user._id});
        if(debugEnabled) console.log('task found:',taskFound);
        if (!taskFound) {
            return res.status(404).send({
                status: 'error',
                message:
                    'No task found for given ID, so get the tags on task',
            });
        }

        // Fetching the tags stored in the task.
        const tagsForTask = taskFound.tags;

        // Returning the tags found for the task.
        return res.status(200).send({
                status: 'ok',
                tags: tagsForTask,
                message:
                    'tags found successfully for the task.',
            });
    }catch(e){
        return res.status(500).send({
            status: 'error',
            message:
                `Error occurred while fetching tags for task: ${e}`,
        });
    }
}

const addTagToTask = async (req, res, next) => {
    if(debugEnabled) console.log('requested to add a tag to a task:', req.params.taskid);

    const taskId = req.params.taskid;
    const tagId = req.params.tagid;

    try{
        // Check if even any task exists with requested task id and the userId.
        // User can only fetch tasks created by him, and can't access tasks created by other users.
        const taskFound = await Task.findById({ _id: taskId.toString() , creator: req.user._id});
        if(debugEnabled) console.log('task found:',taskFound);
        if (!taskFound) {
            return res.status(404).send({
                status: 'error',
                message:
                    'No task found for given ID, so cannot add the tag on task',
            });
        }

        // Whether the tag is already created by the user before.
        // User should first create a tag and then try assigning it to different tasks.
        // Hence need to check whether tag is atleast created by the user before.
        const tagInUserTags = req.user.tags.filter(tag=> tag._id.toString() === tagId);
        if(!tagInUserTags){
            return res.status(404).send({
                status: 'error',
                message:
                    'Tag needs to be created by the user first, and only then it can be assigned to a task. Please create the tag first.',
            });
        }

        // If the tag is already applied on the task, then return.
        // A tag should only be applied once on a task.
        const tagPresentOnTask = taskFound.tags.filter(tag=> tag._id.toString() === tagId);
        if(tagPresentOnTask.length>0){
            return res.status(404).send({
                status: 'error',
                message:
                    'Tag already present on the task, cannot apply it again.',
            });
        }

        // Adding the tag to the list of tags for the task:
        taskFound.tags = taskFound.tags.concat(tagId);
        taskFound.save();

        // Returning the tags found for the task.
        return res.status(200).send({
                status: 'ok',
                tags: taskFound.tags,
                message:
                    'tag added successfully for the task.',
            });
    }catch(e){
        return res.status(500).send({
            status: 'error',
            message:
                `Error occurred while adding tag for task: ${e}`,
        });
    }
}

const removeTagFromTask = async (req, res, next) => {
    if(debugEnabled) console.log('requested to delete a tag from a task:', req.params.taskid);

    const taskId = req.params.taskid;
    const tagId = req.params.tagid;

    //console.log('tagId:', tagId, '\t taskId:', taskId);
    try{
        // Check if even any task exists with requested task id and the userId.
        // User can only fetch tasks created by him, and can't access tasks created by other users.
        const taskFound = await Task.findById({ _id: taskId.toString() , creator: req.user._id});
        if(debugEnabled) console.log('task found:',taskFound);
        if (!taskFound) {
            return res.status(404).send({
                status: 'error',
                message:
                    'No task found for given ID, so cannot add the tag on task',
            });
        }

        // Whether the tag is already created by the user before.
        // User should first create a tag and then try assigning it to different tasks.
        // Hence need to check whether tag is atleast created by the user before.
        const tagInUserTags = req.user.tags.filter(tag=> tag._id.toString() === tagId);
        if(!tagInUserTags){
            return res.status(404).send({
                status: 'error',
                message:
                    'Tag needs to be created by the user first, and only then it can be deleted from a task. Please create the tag first.',
            });
        }

        // Does the tag even exist on the task.
        // If tag doesn't already exist on task, then can't delete it.
        const tagPresentOnTask = taskFound.tags.filter(tag=> tag._id.toString() === tagId);
        if(!tagPresentOnTask || tagPresentOnTask.length===0){
            return res.status(404).send({
                status: 'error',
                message:
                    'Tag not present on the task, cannot delete a tag not present on a task.',
            });
        }

        // Adding the tag to the list of tags for the task:
        taskFound.tags = taskFound.tags.filter(tag=> tag._id.toString() !== tagId);
        taskFound.save();

        // Returning the tags found for the task.
        return res.status(200).send({
                status: 'ok',
                tags: taskFound.tags,
                message:
                    'tag deleted successfully for the task.',
            });
    }catch(e){
        return res.status(500).send({
            status: 'error',
            message:
                `Error occurred while deleting tag for task: ${e}`,
        });
    }
}

module.exports = {
    createTag,
    getTag,
    getTags,
    updateTag,
    deleteTag,
    getTagsForTask,
    addTagToTask,
    removeTagFromTask,
};
