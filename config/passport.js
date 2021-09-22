const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const authUtils = require('../utils/crypto')

// Load User Model
const User = require('../models/User')

module.exports = function (passport) {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'The username entered is not registered' });
                }
                if (user.password != authUtils.hashPassword(password)) {
                    return done(null, false, { message: 'Password is incorrect' });
                }
                else {
                    return done(null, user);
                }
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}
