const express = require('express');
const pool = require('./db/db');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

const inializePassport = require('./passportConfig');

inializePassport(passport);

const app = express();

var whitelist = ['http://localhost:3000', /** other domains if any */];
var corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('myError: Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));
app.use(express.json({limit: '50mb'}));
app.use(session({
    secret: 'secret',
    // store: new (require('connect-pg-simple')(session))(),
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 1000 * 60 * 60
    // }
}));
app.use(passport.initialize());
app.use(passport.session());



require('./routes/authRoutes')(app, pool, passport);
require('./routes/dogRoutes')(app, pool, passport);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});
