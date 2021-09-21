module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    req.flash('error_msg', 'You need to login to continue')
    res.redirect('/users/login')
}

module.exports.isAdmin = (req, res, next) => {

}