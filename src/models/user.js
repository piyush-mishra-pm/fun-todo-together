const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'creator'
});

// Prevents sensitive details stored in DB to be sent as JSON response.
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;

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


userSchema.statics.loginHelper = async function (email, password) {
    // Does the email id exists in DB:
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    // Does the encrypted password stored and encryption of password provided match:
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    // Authenticated user, so proceed:
    return user;
};

// Auth tokens are created after successful logins and stored on the devices. 
// A User can have multiple auth tokens, due to signups from different devices.
userSchema.methods.createAuthToken = async function () {
    // Create a token for the user:
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET_KEY
    );
    
    // Add a token to the existing list of valid tokens of the user.
    user.tokens = user.tokens.concat({ token });

    await user.save();

    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
