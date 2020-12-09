const bcrypt = require('bcrypt');

module.exports = function (app, pool, passport) {

    app.post('/register', checkNotAuthenticated, async (req, res) => {
        try {
            console.log(req.body);

            const { email, password } = req.body;

            const userExists = await doesUserExists(email, pool);
            if (userExists) {
                throw { message: 'user already exists' };
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log(hashedPassword);

            const newUser = await pool.query(
                'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
                [email, hashedPassword]
            );

            res.json(`user ${newUser.rows[0].email} registered`);
        } catch (err) {
            res.json(`registration error: ${err.message}`);
            res.status(500).json(`registration error: ${err.message}`);
        }
    });

    app.get('/login', checkNotAuthenticated, passport.authenticate('local'),
        function(req, res) {
            res.json(`login for user:'${req.user.email}' successfull`);
        }
    );

    app.get('/logout', (req, res) => {
        req.logout();
        res.json('You have logged out successfully' );
    });

    app.get('/test', checkAuthenticated, async (req, res) => {
        res.json('test');
    });

    app.delete('/delete', async (req, res) => {
        try {
            const { email, password } = req.query;

            const user = await pool.query(
                'SELECT * FROM users WHERE email=$1',
                [email]
            );

            if (user.rows[0].password === password) {
                await pool.query(
                    'DELETE FROM users WHERE email=$1',
                    [email]
                );
                console.log(`deleted user ${email}`);
                res.json(`deleted user ${email}`);
            } else {
                console.log(`can't delete user ${email}, wrong password`);
                res.json(`can't delete user ${email}, wrong password`);
            }

        }
        catch (err) {
            console.log(err.message);
            res.json(`delete user failure: ${err.message}`);
        }
    });

    const doesUserExists = async (email, pool) => {
        const user = await getUser(email, pool);
        if (user) {
            return true;
        }
        return false;
    };

    const getUser = async (email, pool) => {
        const user = await pool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        );
        return user.rows[0];
    };
};

const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401);
};

const checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.json({message: 'already authenticated', email:req.user.email});
    } else {
        console.log('not authenticated');
    }
    return next();
};