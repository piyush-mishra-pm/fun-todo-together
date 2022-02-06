const { cookie } = require('express/lib/response');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// On successful identification on basis of token, 
// it makes available a token and a user on request body, 
// which can be used by other middlewares or controllers.
// Authenticated device can attach tokens with requests.
const allowOnlyAuthenticated = async (req, res, next) => {
    try {
        // Could use either header or the cookies for retreiving JWT tokens.
        const token = (req.cookies.token) ;//? req.cookies.token : req.header('Authorization').replace('Bearer ', '');
        const decodedResult = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({
            _id: decodedResult._id,
            'tokens.token': token,
        });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;

        console.log(JSON.stringify(user));

        next();
    } catch (e) {
        return res.status(401).redirect('/login');
        //res.status(401).send({message:`Authentication required!: ${e}`});
    }
};

const allowOnlyUnauthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        // If no token present then proceed to next:
        if (!token) return next();

        const decodedResult = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({
            _id: decodedResult._id,
            'tokens.token': token,
        });

        // If token present, but no corresponding user, then proceed to next:
        if (!user) {
            return next();
        }

        return res.status(301).redirect('/');
    } catch (e) {
        return res.status(301).redirect('/login');
    }
};


module.exports = {
    allowOnlyAuthenticated,
    allowOnlyUnauthenticated
};