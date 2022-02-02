const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'User name must be atleast 3 char long'],
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email is invalid'],
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, 'Password must be atleast 6 chars long'],
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
