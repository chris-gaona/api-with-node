/** A module. Its name is module:app.
 * @module app
 */

// requires all needed modules
/**
* Requires express npm module
* @requires npm install express
*/
var express = require('express');
/**
* Requires path npm module
* @requires npm install path
*/
var path = require('path');
// var favicon = require('serve-favicon');
/**
* Requires morgan npm module
* @requires npm install morgan
*/
var logger = require('morgan');
/**
* Requires cookie-parser npm module
* @requires npm install cookie-parser
*/
var cookieParser = require('cookie-parser');
/**
* Requires body-parser npm module
* @requires npm install body-parser
*/
var bodyParser = require('body-parser');

// ROUTE MODULES
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// only use morgan module in development environment
app.use(logger('dev'));
// body-parser extracts the entire body portion of an incoming request
// stream and exposes it on req.body
app.use(bodyParser.json());
// parses the text as URL encoded data & exposes the resulting object
// (containing the keys and values) on req.body
// when extended is false the object will contain key-value pairs, where the
// value can be a string or array
app.use(bodyParser.urlencoded({ extended: false }));
// parse Cookie header and populate req.cookies with an object keyed by
// the cookie names
app.use(cookieParser());
// pass the name of the directory that contains the static assets to the
// express.static middleware function to start serving the files directly
// uses the absolute path of the directory that you want to serve
app.use(express.static(path.join(__dirname, 'public')));

// creates the routes
app.use('/', routes);
// don't need the following route but left it in for later time
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// gets rid of stracktrace for this project
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
