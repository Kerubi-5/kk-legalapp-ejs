const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

// Load User Model
const User = require('../models/User')



module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'username' },
        // Match user
        function (username, password, done) {
            User.findOne({ username: username }, async function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }

                const match = await bcrypt.compare(password, user.password)

                if (!match) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user);
            });
        }
    ));
}

