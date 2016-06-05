var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var twitterKeys = require('../../twitter-config.json');

var client = new Twitter({
  consumer_key: twitterKeys.consumer_key,
  consumer_secret: twitterKeys.consumer_secret,
  access_token_key: twitterKeys.access_token_key,
  access_token_secret: twitterKeys.access_token_secret
});

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });

  var params = {screen_name: 'chrissgaona', count: 5};
  client.get('statuses/user_timeline', params, function(error, tweets, response){
    if (!error) {
      res.send(tweets);
    }
  });
});

module.exports = router;
