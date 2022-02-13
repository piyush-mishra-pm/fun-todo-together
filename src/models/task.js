const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
        trim: true,
        maxLength:[50, 'Max 50 chars allowed for heading'],
    },
    detail: {
        type: String,
        trim: true,
        maxLength: [400,'Max 200 chars allowed for description'],
    },
    done: {
        type: Boolean,
        default: false,
    },
    creator:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    tags:[mongoose.Schema.Types.ObjectId]
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;