module.exports.isNotAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/dashboard');
    }
}

module.exports.isClient = (req, res, next) => {
    if (req.isAuthenticated() && req.user.user_type == 'client') {
        next();
    }
    else {
        req.flash('error_msg', 'You need to login to continue')
        res.redirect('/users/login')
    }
}

module.exports.isLawyer = (req, res, next) => {
    if (req.isAuthenticated() && req.user.user_type == 'lawyer') {
        return next()
    }
    else {
        res.redirect('/users/login')
    }
}

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.user_type == 'admin') {
        return next()
    }
    else {
        res.redirect('/users/login')
    }
}