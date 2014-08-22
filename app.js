var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var routes = require('./routes/index');
var users = require('./routes/users');

// used for registration page
var register = require('./routes/register');
var messages = require('./lib/messages');


// used for login page
var login = require('./routes/login');

// used for keeping user id in session
var user = require('./lib/middleware/user');

// used for posting messages.
var entries = require('./routes/entries');

// used for post input validation
var validate = require('./lib/middleware/validate');

// for paging
var page = require('./lib/middleware/page');
var Entry = require('./lib/entry');
var app = express();

app.disable('etag');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'keyboard cat', resave: 'true', saveUninitialized: 'true' }));
app.use(user);
app.use(messages);

// app.use(app.router);


// app.use('/', routes);
// app.use('/users', users);

// have / return the entries list
// app.get('/', page(Entry.count, 5), entries.list); 

// routes for registration page
app.get('/register', register.form);
app.post('/register', register.submit);

// routes for login page
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

// for listing posts
app.get('/post', entries.form);
app.post('/post',
	validate.required('entry[title]'),
	validate.lengthAbove('entry[title]', 4),
	entries.submit);
	
app.get('/:page?', page(Entry.count, 5), entries.list);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
 app.set('development', false);

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
		console.log('dev error page rendered');
    });
} else {


app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
			console.log('prod error page rendered');
});
}


module.exports = app;
