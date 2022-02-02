const mongoose = require('mongoose');
const Task = require('../models/task');

const getTask = (req, res, next) => {
    res.send('Requested Tasks');
};

module.exports = {
    getTask,
};
