const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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

// Prevents sensitive details stored in DB to be sent as JSON response.
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    delete userObject.password;

    return userObject;
};

// Encrypting the password before saving it (SingUp/Creation or Updation User of would affect it).
userSchema.pre('save', async function (next) {
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8);
    }

    next();
})


const User = mongoose.model('User', userSchema);

module.exports = User;
