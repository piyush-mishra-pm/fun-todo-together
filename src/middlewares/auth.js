const jwt = require('jsonwebtoken');
const User = require('../models/user');

// On successful identification on basis of token, 
// it makes available a token and a user on request body, 
// which can be used by other middlewares or controllers.
// Authenticated device can attach tokens with requests.
const auth = async(req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decodedResult = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findOne({_id:decodedResult._id,'tokens.token':token});

        if(!user){
            throw new Error();
        }

        req.token = token;
        req.user = user;

        next();

    } catch(e){
        return res.status(401).redirect('/login');
        //res.status(401).send({message:`Authentication required!: ${e}`});
    }
}

module.exports = auth;