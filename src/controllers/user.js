const User = require('../models/user');

const COOKIE_NAME = 'token';
const authCookieOptions = {
    maxAge: 1000*60*60*24, // 1 day max life
    httpOnly: true,
};

// On Sign-Up:
const createUser = async (req, res, next) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.createAuthToken();
        return res.cookie(COOKIE_NAME,token, authCookieOptions).status(201).send({
            status:'ok',
            user,
            message: 'Created a User',
            token: token,
        });
    } catch (e) {
        return res.status(400).send({
            status:'error',
            user,
            message: `Error occurred while creating the User: ${e}`,
        });
    }
};


const logInUser = async (req, res, next) => {
    try{
        const user = await User.loginHelper(req.body.email, req.body.password);
        const token =await user.createAuthToken();
        return res.cookie(COOKIE_NAME,token, authCookieOptions).send({status:'ok', user,message:'logged in successfully',token});
    }catch(e){
        return res.status(400).send({status:'error', message: `Error occurred while logging-in. ${e}`});
    }
}

const logOutUser = async (req,res, next) => {
    try{
        // As user is logging out on the current device, 
        // so remove the token on this device from User's available list of tokens.
        // Token attached with this device is present in the request body.
        req.user.tokens = req.user.tokens.filter((t)=> {
            return t.token !== req.token;
        });
        // Save the updated list of tokens 
        // (after removing token for present device).
        await req.user.save();

        //return res.send({status:'ok', message:'User logged out successfully'});
        return res.clearCookie(COOKIE_NAME, authCookieOptions).redirect('/');
        
    } catch (e){
        return res.status(500).send({status:'error', message:`Error occurred while logging out ${e}`});
    }
}

// Log out the user from all devices by clearing out all the tokens.
const logOutUserAllTokens = async (req,res, next) => {
    try{
        // Clear the tokens with User.
        req.user.tokens = [];
        await req.user.save();
        //return res.send({status:'ok', message:'Logged out from all devices successfully!'})
        return res.clearCookie(COOKIE_NAME, authCookieOptions).redirect('/');
    }catch(e){
        return res.status(500).send({ status:'error', message: `Error occurred while logging out from all devices! : ${e}` });
    }
}

const getUser = async (req, res, next) => {
    return res.send(req.user);
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
            status:'error',
            message: 'Update is not allowed on the attributes requested.',
        });
    }

    try {
        updatesAskedToDo.forEach(
            update => (req.user[update] = req.body[update])
        );
        await req.user.save();

        return res.send({ status:'ok', user:req.user, message: 'Requested Update finished.' });
    } catch (e) {
        return res
            .status(500)
            .send({ status:'error', message: `Error occurred while updating the user: ${e}` });
    }
};

const deleteUser = async (req, res, next) => {
    try {
        await req.user.remove();
        return res.send({ status:'ok', user:req.user, message: 'Deleted the requested user' });
    } catch (e) {
        return res.status(500).send({
            status:'error',
            message: `Error occurred while deleting the user: ${e}`,
        });
    }
};

module.exports = {
    createUser,
    logInUser,
    logOutUser,
    logOutUserAllTokens,
    getUser,
    updateUser,
    deleteUser,
};
