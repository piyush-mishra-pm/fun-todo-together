const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
        trim: true,
    },
    detail: {
        type: String,
        required: true,
        trim: true,
    },
    done: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;