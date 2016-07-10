/** A module. Its name is module:app.
 * @module app
 */
'use strict';

var http = require('http');

// requires all needed modules
/**
* Requires express npm module
* @requires express
*/
var express = require('express');
/**
* Requires path npm module
* @requires path
*/
var path = require('path');
// var favicon = require('serve-favicon');
/**
* Requires morgan npm module
* @requires morgan
*/
var logger = require('morgan');
/**
* Requires cookie-parser npm module
* @requires cookie-parser
*/
var cookieParser = require('cookie-parser');
/**
* Requires body-parser npm module
* @requires body-parser
*/
var bodyParser = require('body-parser');

// ROUTE MODULES
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Twitter module to make Twitter api requests
/**
* Requires twitter npm module to handle request to twitter api
* @requires npm install twitter
*/
var Twitter = require('twitter');
// adds twitter keys from external file
var twitterKeys = require('../twitter-config.json');

// defines client object for Twitter module
/**
* Twitter API client keys & secrets
* @name client
*/
var client = new Twitter({
  consumer_key: twitterKeys.consumer_key,
  consumer_secret: twitterKeys.consumer_secret,
  access_token_key: twitterKeys.access_token_key,
  access_token_secret: twitterKeys.access_token_secret
});

/**
* Requires streamHandler module to deal with stream from twitter api
* @requires streamHandler
*/
var streamHandler = require('./utils/streamHandler.js');

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
    var message;
    if (err.status === 404) {
      message = '404 Page Not Found';
    } else {
      message = '500 Server Error';
    }
    res.render('error', {
      message: err.message,
      error: err,
      client: message
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

// creates server
var server = http.createServer(app);

// server listens on port 3000 & logs message to console
server.listen(3000, function () {
  console.log('Server listening on: http://localhost:3000');
});

// creates socket.io listener on the server
var io = require('socket.io').listen(server);

// uses twitter module to stream from twitter api
client.stream('statuses/filter', { follow: '2252277176' }, function (stream) {
  console.log('Running stream!');
  // calls streamHandler function & passes in stream & io
  streamHandler(stream, io);
}); // client.stream
