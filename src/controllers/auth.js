function getSignUpPage(req,res){
    res.render('auth/signup');
}

function getLoginPage(req, res) {
    res.render('auth/login');
}

module.exports = {
    getSignUpPage,
    getLoginPage,
}