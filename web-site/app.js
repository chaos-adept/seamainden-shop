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
var LeveldbStore = require('connect-leveldb')(express);

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

app.use(express.static(path.join(__dirname, '../web-front-end/angular')));

app.use(express.session({
    store: new LeveldbStore({
        dbLocation: conf.levelDb.baseFolder+"/sessions",
        ttl: 60 * 60 * 3
    }),
    secret: 'foobarbaz'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);

// ROUTINES

app.get('/', function(req, res) {
    console.log("req.user " + req.user);
    var user = req.user ? req.user : {displayName: "Guest", isGuest:true};
  res.render('index', { title: 'Express', user:user  });
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
    passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/error' }));

app.get('/users/auth/logout', function (req, res) {

    req.logout(); 
    res.redirect('/');
});

// Настройка стратегий авторизации

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
