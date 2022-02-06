function getHomePage(req, res) {
    return res.redirect('/tasks');
}

module.exports = {
    getHomePage,
};
