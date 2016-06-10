'use strict';
// call modules assign them to variables
var express = require('express');
var router = express.Router();
// Twitter module to make Twitter api requests
var Twitter = require('twitter');
// adds twitter keys from external file
var twitterKeys = require('../../twitter-config.json');

// defines client object for Twitter module
var client = new Twitter({
  consumer_key: twitterKeys.consumer_key,
  consumer_secret: twitterKeys.consumer_secret,
  access_token_key: twitterKeys.access_token_key,
  access_token_secret: twitterKeys.access_token_secret
});

/** Parses dates from twitter for timeline & direct
* messages
* @constructor
* @param {string} tdate - Date from twitter api
* @param {boolean} booleanValue - boolean for whether adding
* to timeline or direct messages
*/
function parseTwitterDate (tdate, booleanValue) {
  // parses a string representation of a date, &
  // returns the number of milliseconds since
  // January 1, 1970
  var systemDate = new Date(Date.parse(tdate));
  // gets today's date
  var userDate = new Date();
  // splits tdate string at space into array with
  // each word
  var splitDate = tdate.split(' ');
  // gets difference between twitter date & user date
  // divide the value by 1000 to change milliseconds
  // into seconds
  var diff = Math.floor((userDate - systemDate) / 1000);

  // adds text depending on how many seconds the diff is
  // booleanValue is used to deterime to put text in
  // timeline section or direct messages section
  if (diff <= 1) { return 'just now'; }

  if (diff < 60 && booleanValue === true) { return diff + 's'; }
  if (diff < 60 && booleanValue === false) { return diff + ' seconds ago'; }

  if (diff <= 90 && booleanValue === true) { return '1m'; }
  if (diff <= 90 && booleanValue === false) { return 'one minute ago'; }

  if (diff <= 3540 && booleanValue === true) { return Math.round(diff / 60) + 'm'; }
  if (diff <= 3540 && booleanValue === false) { return Math.round(diff / 60) + ' minutes ago'; }

  if (diff <= 5400 && booleanValue === true) { return '1h'; }
  if (diff <= 5400 && booleanValue === false) { return '1 hour ago'; }

  if (diff <= 86400 && booleanValue === true) { return Math.round(diff / 3600) + 'h'; }
  if (diff <= 86400 && booleanValue === false) { return Math.round(diff / 3600) + ' hours ago'; }

  if (diff <= 129600 && booleanValue === true) { return '1d'; }
  if (diff <= 129600 && booleanValue === false) { return '1 day ago'; }

  if (diff < 604800 && booleanValue === true) { return Math.round(diff / 86400) + 'd'; }
  if (diff < 604800 && booleanValue === false) { return Math.round(diff / 86400) + ' days ago'; }

  if (diff <= 777600 && booleanValue === true) { return '1w'; }
  if (diff <= 777600 && booleanValue === false) { return '1 week ago'; }

  // if none of the above return true show actual date
  return splitDate[1] + ' ' + splitDate[2];
}

// gets /stream-tweets route & handles request & response
// for streaming routes
router.get('/stream-tweets', function (req, res, next) {
  console.log('Running stream!');
  // uses twitter module to stream from twitter api
  client.stream('statuses/filter', { follow: '2252277176' }, function (stream) {
    // on receiving the data do the following
    stream.on('data', function (tweet) {
      // if the tweet has been retweeted use this object
      if (tweet.retweeted_status !== undefined) {
        res.json({
          'success': true,
          'name': tweet.user.name,
          'username': tweet.user.screen_name,
          'text': tweet.text,
          'retweet': tweet.retweeted_status.retweet_count,
          'like': tweet.retweeted_status.favorite_count,
          'image': tweet.user.profile_image_url_https,
          'date': parseTwitterDate(tweet.created_at, true)
        });
      // else if it's a new tweet use this object
      } else {
        res.json({
          'success': true,
          'name': tweet.user.name,
          'username': tweet.user.screen_name,
          'text': tweet.text,
          'retweet': tweet.retweet_count,
          'like': tweet.favorite_count,
          'image': tweet.user.profile_image_url_https,
          'date': parseTwitterDate(tweet.created_at, true)
        });
      } // if statement
    }); // on data
    // on stream error log the error
    stream.on('error', function (error) {
      console.log(error);
      throw error;
    }); // on error
  }); // client.stream
}); // router.get

/* GET home page. */
router.get('/', function (req, res, next) {
  // define params variable for twitter module
  var params = {screen_name: 'chrissgaona', count: 5};

  getTimelineInfo();

  /** creates getTimelineInfo function
  * @constructor
  */
  function getTimelineInfo () {
    // uses Twitter module to get timeline info
    // passing in params for get request to twitter API
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
      // defines needed variables
      var tweetsArray = [];
      var profileImage;
      var backgroundImage;

      // if there is no error
      if (!error) {
        var tweetsObject;

        // creates for loop through tweets response from
        // twitter API
        for (var i = 0; i < tweets.length; i++) {
          profileImage = tweets[i].user.profile_image_url_https;
          backgroundImage = tweets[i].user.profile_banner_url;

          // if tweet has been retweeted use the following
          // object
          if (tweets[i].retweeted_status !== undefined) {
            tweetsObject = {
              created_at: parseTwitterDate(tweets[i].created_at, true),
              profile_image: tweets[i].user.profile_image_url_https,
              name: tweets[i].user.name,
              screen_name: tweets[i].user.screen_name,
              text: tweets[i].retweeted_status.text,
              retweet_count: tweets[i].retweeted_status.retweet_count,
              favorite_count: tweets[i].retweeted_status.favorite_count,
              friends_count: tweets[i].user.friends_count
            };

          // else if tweet has NOT been retweeted use
          // the following object
          } else {
            tweetsObject = {
              created_at: parseTwitterDate(tweets[i].created_at, true),
              profile_image: tweets[i].user.profile_image_url_https,
              name: tweets[i].user.name,
              screen_name: tweets[i].user.screen_name,
              text: tweets[i].text,
              retweet_count: tweets[i].retweet_count,
              favorite_count: tweets[i].favorite_count,
              friends_count: tweets[i].user.friends_count
            };
          } // if statement
          // push the object to tweetsArray
          tweetsArray.push(tweetsObject);
        } // for loop

        // calls getFriends function & passes in needed
        // variables as parameters
        getFriends(tweetsObject, tweetsArray, profileImage, backgroundImage);
      } else {
        // else if error log it
        console.log(error);
      } // if statement
    }); // client.get
  } // getTimelineInfo()

  /** gets friends of user from twitter api
  * @constructor
  * @param tweetsObject {object} - raw tweets object
  * @param tweetsArray {array} - tweets array containing
  * 5 recent tweets
  * @param profileImage {string} - contains profile image
  * of user to perform
  * @param backgroundImage {string} - contains user
  * background image
  */
  function getFriends (tweetsObject, tweetsArray, profileImage, backgroundImage) {
    // uses twitter module to get friends list
    client.get('friends/list', params, function (error, friends, response) {
      // define needed variables
      var friendsArray = [];

      // if there is no error...
      if (!error) {
        var friendsObject;

        // for loop through the friends
        for (var i = 0; i < friends.users.length; i++) {
          friendsObject = {
            profile_image: friends.users[i].profile_image_url_https,
            name: friends.users[i].name,
            screen_name: friends.users[i].screen_name
          };
          friendsArray.push(friendsObject);
        }

        // calls getReceivedMessages & passes in needed
        // parameters
        getReceivedMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray);
      } else {
        console.log(error);
      } // if statement
    }); // client.get
  } // getFriends()

  /** gets user's 5 recent received direct messages
  * @constructor
  * @param tweetsObject {object} - raw tweets object
  * @param tweetsArray {array} - tweets array containing
  * 5 recent tweets
  * @param profileImage {string} - contains profile image
  * of user to perform
  * @param backgroundImage {string} - contains user
  * background image
  * @param friendsArray {array} - array containg 5 latest
  * friends
  */
  function getReceivedMessages (tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray) {
    // ueses twitter module to get direct messages sent
    // to the user
    client.get('direct_messages', params, function (error, messages, response) {
      // defines needed variables
      var messagesReceivedArray = [];
      var recipientName = [];

      // if there is no error...
      if (!error) {
        var messagesReceivedObject;

        // loop through messages
        for (var i = 0; i < messages.length; i++) {
          var messageDate = messages[i].created_at;

          var recName = messages[i].sender.name;

          // if there are multiple users in direct messages
          // add names of the users but each name only once
          if (recipientName.indexOf(recName) === -1) {
            recipientName.push(messages[i].sender.name);
          } else {
            console.log('Already there!');
          }

          // creates messages received object
          messagesReceivedObject = {
            recipient: true,
            text: messages[i].text,
            name: messages[i].sender.name,
            picture: messages[i].sender.profile_image_url_https,
            created_at: messages[i].created_at,
            date: parseTwitterDate(messageDate, false)
          };
          // pushes object to array
          messagesReceivedArray.push(messagesReceivedObject);
        } // for loop

        // calls getSentMessages & adds needed parameters
        getSentMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray, messagesReceivedArray, recipientName);
      } else {
        console.log(error);
      } // if statement
    }); // client.get
  } // getReceivedMessages()

  /** gets user's 5 recent sent direct messages
  * @constructor
  * @param tweetsObject {object} - raw tweets object
  * @param tweetsArray {array} - tweets array containing
  * 5 recent tweets
  * @param profileImage {string} - contains profile image
  * of user to perform
  * @param backgroundImage {string} - contains user
  * background image
  * @param friendsArray {array} - array containg 5 latest
  * friends
  * @param messagesReceivedArray {array} - contains messages
  * received
  * @param recipientName {string} - recipients name
  */
  function getSentMessages (tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray, messagesReceivedArray, recipientName) {
    // uses twitter module to get direct messages sent
    // by the user
    client.get('direct_messages/sent', params, function (error, messages, response) {
      // defines needed variables
      var messagesSentArray = [];
      var allMessages;

      // if there is no error
      if (!error) {
        var messagesSentObject;

        // loop through messages
        for (var i = 0; i < messages.length; i++) {
          var messageDate = messages[i].created_at;

          // adds to messagesSentObject
          messagesSentObject = {
            recipient: false,
            text: messages[i].text,
            name: messages[i].sender.name,
            picture: messages[i].sender.profile_image_url_https,
            created_at: messages[i].created_at,
            date: parseTwitterDate(messageDate, false)
          };
          // pushes object into array
          messagesSentArray.push(messagesSentObject);
        } // for loop

        // adds both received & sent messages into one array
        allMessages = messagesReceivedArray.concat(messagesSentArray);

        // sorts the array by date to get them in the
        // correct order
        allMessages.sort(function (a, b) {
          var keyA = new Date(a.created_at);
          var keyB = new Date(b.created_at);
          // Compare the 2 dates
          if (keyA < keyB) return 1;
          if (keyA > keyB) return -1;
          return 0;
        });

        var recipName;

        // adds if statement to change string depending on
        // how many users are a in direct messages section
        // can handle up to 4 separate users
        if (recipientName.length === 1) {
          recipName = recipientName[0];
        } else if (recipientName.length === 2) {
          recipName = recipientName[0] + ', ' + recipientName[1];
        } else if (recipientName.length === 3) {
          recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2];
        } else if (recipientName.length === 4) {
          recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2] + ', ' + recipientName[3];
        } // if statement

        // finally renders the needed variables into the
        // index page on page load
        // jade uses the variables in the object to add
        // content to the template
        res.render('index', {
          username: tweetsObject.screen_name,
          following: tweetsObject.friends_count,
          tweets: tweetsArray,
          friends: friendsArray,
          messages: allMessages,
          recipient: recipName,
          image: profileImage,
          background: backgroundImage
        });
      } else {
        console.log(error);
      } // if statement
    }); // client.get
  } // getSentMessages()
}); // router.get()

// post route /tweet to add a new tweet from app page
router.post('/tweet', function (req, res, next) {
  // contains tweet sent from ajax request as data
  var statusText = req.body.tweet;

  /** posts new tweet from application to twitter api
  * @constructor
  */
  function postNewTweet () {
    // sets up tweet from client to be sent to twitter api
    var tweetParams = {status: statusText};
    // uses twitter module to post tweet to twitter
    client.post('statuses/update', tweetParams, function (error, tweet, response) {
      // if there is no error...
      if (!error) {
        console.log(tweet);
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

  postNewTweet();
}); // router.post()

// exports router
module.exports = router;
