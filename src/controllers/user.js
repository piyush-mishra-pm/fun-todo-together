const mongoose = require('mongoose');
const User = require('../models/user');

const getUser = (req,res,next)=>{
    res.send('Requested Users');
};

module.exports = {
    getUser,
}