const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/User')

function initialize(passport, getUserByUserName) {
    const authenticateUser = async (username, password, done) => {
        const user = getUserByUserName(username)
        if (user == null) {
            return done(null, false, { message: 'Username does not exists' })
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        } catch (e) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({
        usernameField: 'username'
    },
        authenticateUser
    ))

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
}

module.exports = initialize