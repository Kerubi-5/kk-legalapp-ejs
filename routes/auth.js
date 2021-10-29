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
  if (req.isAuthenticated() && req.user.user_type == "client") {
    next();
  } else {
    req.flash("error_msg", "You need to login to continue");
    res.redirect("/users/login");
  }
};

module.exports.isLawyer = (req, res, next) => {
  if (req.isAuthenticated() && req.user.user_type == "lawyer") {
    return next();
  } else {
    req.flash("error_msg", "You need to login to continue");
    res.redirect("/users/login");
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.user_type == "admin") {
    return next();
  } else if (req.isAuthenticated()) {
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
    (req.user.user_type == "client" || req.user.user_type == "lawyer")
  ) {
    if (req.user.is_verified) return next();
    else res.redirect("/unverified");
  } else {
    res.redirect("/users/login");
  }
};
