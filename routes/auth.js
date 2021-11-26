const AuthRoles = require("../controllers/EnumTypes/AuthRoles")

module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "You need to login to continue");

    res.redirect("/users/login");
  }
};

module.exports.isNotAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/dashboard");
  }
};

module.exports.isClient = (req, res, next) => {
  if (req.isAuthenticated() && req.user.user_type == AuthRoles.CLIENT) {
    next();
  } else {
    req.flash("error_msg", "You need to login to continue");
    res.redirect("/users/login");
  }
};

module.exports.isLawyer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.user_type == AuthRoles.LAWYER) {
    return next();
  } else {
    req.flash("error_msg", "You need to login to continue");
    res.redirect("/users/login");
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.user_type == AuthRoles.ADMIN) {
    return next();
  } else if (req.isAuthenticated() && req.user.user_type != AuthRoles.ADMIN) {
    req.flash(
      "error_msg",
      "You must have admin privilleges to view this resource"
    );
    res.redirect("/dashboard");
  } else {
    req.flash("error_msg", "You need to login to continue");
    res.redirect("/users/login");
  }
};

module.exports.isClientOrLawyer = (req, res, next) => {
  if (
    req.isAuthenticated() &&
    (req.user.user_type == AuthRoles.CLIENT || req.user.user_type == AuthRoles.LAWYER)
  ) {
    if (!req.user.is_verified) res.redirect("/unverified");
    else if (req.user.is_locked) res.redirect("/lock");
    else next();
  } else if (req.isAuthenticated() && req.user.user_type == AuthRoles.ADMIN) {
    res.redirect("/admin");
  } else {
    req.flash("error_msg", "You need to login to continue");
    res.redirect("/users/login");
  }
};
