const User = require('../models/user');

const createUser = async (req, res, next) => {
    const user = new User(req.body);
    try {
        await user.save();
        return res.status(201).send({
            user,
            message: 'Created a User',
        });
    } catch (e) {
        return res.status(400).send({
            user,
            message: `Error occurred while creating the User: ${e}`,
        });
    }
};

const getUser = async (req, res, next) => {
    try {
        const userFound = await User.findOne({ _id: req.params.id });
        if (!userFound)
            return res
                .status(404)
                .send({ message: 'Could not find the resquested user' });

        return res.send(userFound);
    } catch (e) {
        return res
            .status(500)
            .send({ message: `Error occurred while fetching the user: ${e}` });
    }
};

const updateUser = async (req, res, next) => {
    // Check if all the updates which are asked to do, are even allowed:
    const updatesAskedToDo = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const canUpdate = updatesAskedToDo.every(update =>
        allowedUpdates.includes(update)
    );

    if (!canUpdate) {
        return res.status(400).send({
            message: 'Update is not allowed on the attributes requested.',
        });
    }

    try {
        const userFound = await User.findOne({ _id: req.params.id });

        if (!userFound) {
            return res.status(404).send({
                message:
                    'Could not find the user and hence will not update the user.',
            });
        }

        updatesAskedToDo.forEach(
            update => (userFound[update] = req.body[update])
        );

        await userFound.save();
        return res.send({ userFound, message: 'Requested Update finished.' });
    } catch (e) {
        return res
            .status(500)
            .send({ message: `Error occurred while updating the user: ${e}` });
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const userFound = await User.findOneAndDelete({ _id: req.params.id });

        if (!userFound) {
            return res.status(404).send({ message: 'Could not find the user' });
        }

        return res.send({ userFound, message: 'Deleted the requested user' });
    } catch (e) {
        return res.status(500).send({
            message: `Error occurred while deleting the user: ${e}`,
        });
    }
};

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
};
