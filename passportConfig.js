const localStrategy = require('passport-local').Strategy;
const pool = require('./db/db');
const bcrypt = require('bcrypt');

const initialize = (passport) => {
    const authenticateUser = async (email, password, done) => {
        
        const userFromDb = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        )

        if (!userFromDb || !userFromDb.rows[0]) {
            console.log('error');
            return
        }

        const user = userFromDb.rows[0]

        

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('some error');
            return done(null, false, { message: 'passwords don\'t match' })
            return
        } else {

            return done(null, user)
        }
    }

    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
    },
        authenticateUser
    ))

    passport.serializeUser((user, done) => {
        console.log('piiiy')
        return done(null, user.user_id)
    })

    passport.deserializeUser(async (user_id, done) => {
        console.log('piiy')
        const userFromDb = await pool.query("SELECT * FROM users WHERE user_id = $1",[user_id])

        if (userFromDb && userFromDb.rows[0]) {
            const user = userFromDb.rows[0]
            return done(null, user)
        }
    })

}

module.exports = initialize