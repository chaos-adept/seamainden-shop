var conf = require('config');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var level = require('level');
var UserApi = require('./userApi/userApi');
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;
var passportBearerStrategy = require('passport-http-bearer').Strategy;
var passportFacebookStrategy = require('passport-facebook').Strategy;

var userDb = level(conf.levelDb.baseFolder + '/user', { valueEncoding: 'json' });
var userApi = UserApi(userDb);
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, './public/web-front-end/angular')));
app.use(passport.initialize());

// ROUTINES

app.get('/', function(req, res) {
    res.redirect('/app/index.html');
});


app.post('/users/auth/register', function (req, res) {
    console.log('new user registers', req.body);
    req.body.provider = 'local';
    req.body.id = req.body.login;
    req.body.displayName = req.body.login;
    userApi.storeUser(req.body, function (error, user) {
        if (error) {
            res.send(500, 'Error registering user');
        } else {
            req.login(user, function (error) {
                if (error) { res.send(500, error); }
                else { res.redirect('/'); }
            });
        }
    });
});

app.post('/users/auth/login', 
    passport.authenticate('local',
        {
            session: false,
            successRedirect: '/',
            failureRedirect: '/error' }));

app.get('/users/auth/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/users/auth/facebook', passport.authenticate('facebook'));

app.get('/users/auth/facebook/callback', passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/app/index.html#login?fault=true'
}), function (req, res) {
    userApi.generateTokenForUser(req.user, function (error, token) {
        res.redirect('/app/index.html#/login?access_token=' + token)
    });
});

app.get('/users/private/test', passport.authenticate('bearer', { session: false }),
    function(req, res){
        res.json({ username: req.user.username, email: req.user.email });
    });

// passport strategies

passport.serializeUser(userApi.serializeUser);
passport.deserializeUser(userApi.deserializeUser);

passport.use(new passportLocalStrategy(function (username, password, callback) {
    console.log('password auth', {username: username, password: password});
    var profile = {
        provider: 'local',
        id: username
    };
    var userId = 'local:' + username;
    userApi.getUser(userId, function (error, user) {
        if (error) {
            if (error.name == 'NotFoundError') {
                callback(null, false, {message: 'Incorrect username'});
            } else {
                callback(error);
            }
        } else {
            if (user) {
                // Пользователь найден, далее проверяем пароль
                var passwordIsCorrect = userApi.checkPassword(user, password);
                if (passwordIsCorrect) {
                    callback(null, user);
                } else {
                    callback(null, false, { message: 'Incorrect password'});
                }
            } else {
                callback(null, false, {message: 'Incorrect username'});
            }
        }

    })
}));

passport.use(new passportBearerStrategy({
    },
    function(token, done) {
        userApi.findByToken(token, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
    }
));


passport.use(new passportFacebookStrategy({
        clientID: conf.facebook.id,
        clientSecret: conf.facebook.secret,
        callbackURL: 'http://' + conf.host + ':' + conf.port + '/users/auth/facebook/callback'
    },
    function (accessToken, refreshToken, profile, callback) {
        userApi.findOrCreateUser(profile, callback);
    }));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
