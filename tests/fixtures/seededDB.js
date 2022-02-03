const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Task = require('../../src/models/task');
const User = require('../../src/models/user');

const user1Id = new mongoose.Types.ObjectId();
const user1 = {
    _id: user1Id,
    name: 'user1',
    email: 'u1@ex.com',
    password: 'user1Passw',
    tokens: [
        {
            token: jwt.sign({ _id: user1Id }, process.env.JWT_SECRET_KEY),
        },
    ],
};

const user2Id = new mongoose.Types.ObjectId();
const user2 = {
    _id: user2Id,
    name: 'user2',
    email: 'u2@ex.com',
    password: 'user2Passw',
    tokens: [
        {
            token: jwt.sign({ _id: user2Id }, process.env.JWT_SECRET_KEY),
        },
    ],
};

const task1u1 = {
    _id: new mongoose.Types.ObjectId(),
    heading: 'TODO1_u1',
    detail: 'task 1 of u1',
    done: false,
    creator: user1._id,
};

const task2u1 = {
    _id: new mongoose.Types.ObjectId(),
    heading: 'TODO2_u1',
    detail: 'task 2 of u1',
    done: true,
    creator: user1._id,
};

const task1u2 = {
    _id: new mongoose.Types.ObjectId(),
    heading: 'TODO1_u2',
    detail: 'task 1 of u2',
    done: true,
    creator: user2._id,
};

const initDatabase = async () => {
    // Clean up the DB first:
    await User.deleteMany();
    await Task.deleteMany();

    // Seed the test data in DB:
    await new User(user1).save();
    await new User(user2).save();
    await new Task(task1u1).save();
    await new Task(task2u1).save();
    await new Task(task1u2).save();
};

module.exports = {
    user1Id,
    user1,
    user2Id,
    user2,
    task1u1,
    task2u1,
    task1u2,
    initDatabase,
};