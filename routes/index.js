/** A module. Its name is module:router.
 * @module router
 */

'use strict';
// call modules & assign them to variables
/**
* Requires express npm module
* @requires npm install express
*/
var express = require('express');
var router = express.Router();

// TODO: Comment here
var async = require("async");

var Twitter = require('twitter');
// adds twitter keys from external file
var twitterKeys = require('../../twitter-config.json');

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

var parseTwitterDate = require('../utils/parseDate.js');
var getTimelineInfo = require('../utils/timelineInfo.js');
var getfriendsInfo = require('../utils/friendsInfo.js');
var getReceivedMessages = require('../utils/receivedMessages.js');
var getSentMessages = require('../utils/sentMessages.js');

// define params variable for twitter module
var params = {screen_name: 'chrissgaona', count: 5};

/* GET home page. */
router.get('/', function (req, res, next) {
  async.parallel([
      getUserTimeline,
      getUserFriends,
      getMessagesReceived,
      getMessagesSent
  ], function (err, results) {
    var username = getTimelineInfo(results[0]).tweetsObject.screen_name,
    following = getTimelineInfo(results[0]).tweetsObject.friends_count,
    tweets = getTimelineInfo(results[0]).tweets,
    friends = getfriendsInfo(results[1]),
    messagesReceivedArray = getReceivedMessages(results[2]).messagesReceivedArray,
    recipientName = getReceivedMessages(results[2]).recipientName,
    allMessages = getSentMessages(results[3], messagesReceivedArray, recipientName).allMessages,
    recipName = getSentMessages(results[3], messagesReceivedArray, recipientName).recipName,
    profileImage = getTimelineInfo(results[0]).profileImage,
    backgroundImage = getTimelineInfo(results[0]).backgroundImage;

    res.render('index', {
      username: username,
      following: following,
      tweets: tweets,
      friends: friends,
      messages: allMessages,
      recipient: recipName,
      image: profileImage,
      background: backgroundImage
    });
  });
}); // router.get()

function getUserTimeline(callback) {
  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, tweets);
  });
}
function getUserFriends(callback) {
  client.get('friends/list', params, function (error, friends, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, friends);
  });
}
function getMessagesReceived(callback) {
  client.get('direct_messages', params, function (error, messages, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, messages);
  });
}
function getMessagesSent(callback) {
  client.get('direct_messages/sent', params, function (error, messagesSent, response) {
    if(error) { console.log(error); callback(true); return; }
    callback(null, messagesSent);
  });
}

/** Posts new tweet from application to twitter api
* @function
* @param res - response to send to client
* @param {string} statusText - tweet text created by user
*/
function postNewTweet (res, statusText) {
  // sets up tweet from client to be sent to twitter api
  var tweetParams = {status: statusText};
  // uses twitter module to post tweet to twitter
  client.post('statuses/update', tweetParams, function (error, tweet, response) {
    // if there is no error...
    if (!error) {
      // send response to client handled by ajax
      res.json({
        'message': 'Successfully sent tweet!',
        'title': tweet.title
      });
    } else {
      console.log(error);
      // else send error response to client handled by
      // ajax
      res.json({
        'message': 'There was an error!',
        'errorMessage': error
      });
    } // if statement
  }); // client.post
} // postNewTweet()

// post route /tweet to add a new tweet from app page
router.post('/tweet', function (req, res, next) {
  // contains tweet sent from ajax request as data
  var statusText = req.body.tweet;
  postNewTweet(res, statusText);
}); // router.post()

// exports router
module.exports = router;
