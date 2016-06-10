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

// function to parse dates from twitter for timeline
// && direct messages
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

router.get('/stream-tweets', function (req, res, next) {
  console.log('Running stream!');
  var tweetsArray = [];
  client.stream('statuses/filter', { follow: '2252277176' }, function (stream) {
    stream.on('data', function (tweet) {
      console.log(tweet.text);

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
      }
    });
    stream.on('error', function (error) {
      console.log(error);
      throw error;
    });
  });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  // define params variable for twitter module
  var params = {screen_name: 'chrissgaona', count: 5};

  getTimelineInfo();

  // creates getTimelineInfo function
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
          }
          // push the object to tweetsArray
          tweetsArray.push(tweetsObject);
        }

        // calls getFriends function & passes in needed
        // variables as parameters
        getFriends(tweetsObject, tweetsArray, profileImage, backgroundImage);
      } else {
        // else if error log it
        console.log(error);
      }
    });
  } // getTimelineInfo()

  function getFriends (tweetsObject, tweetsArray, profileImage, backgroundImage) {
    client.get('friends/list', params, function (error, friends, response) {
      var friendsArray = [];

      if (!error) {
        var friendsObject;
        // console.log(friends);

        for (var i = 0; i < friends.users.length; i++) {
          friendsObject = {
            profile_image: friends.users[i].profile_image_url_https,
            name: friends.users[i].name,
            screen_name: friends.users[i].screen_name
          };
          friendsArray.push(friendsObject);
        }
        // console.log(friendsArray);

        getReceivedMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray);
      } else {
        console.log(error);
      }
    });
  } // getFriends()

  function getReceivedMessages (tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray) {
    client.get('direct_messages', params, function (error, messages, response) {
      var messagesReceivedArray = [];
      var recipientName = [];

      if (!error) {
        var messagesReceivedObject;

        for (var i = 0; i < messages.length; i++) {
          var messageDate = messages[i].created_at;

          var recName = messages[i].sender.name;

          if (recipientName.indexOf(recName) === -1) {
            recipientName.push(messages[i].sender.name);
          } else {
            console.log('Already there!');
          }

          messagesReceivedObject = {
            recipient: true,
            text: messages[i].text,
            name: messages[i].sender.name,
            picture: messages[i].sender.profile_image_url_https,
            created_at: messages[i].created_at,
            date: parseTwitterDate(messageDate, false)
          };
          messagesReceivedArray.push(messagesReceivedObject);
        }

        getSentMessages(tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray, messagesReceivedArray, recipientName);
      } else {
        console.log(error);
      }
    });
  } // getReceivedMessages()

  function getSentMessages (tweetsObject, tweetsArray, profileImage, backgroundImage, friendsArray, messagesReceivedArray, recipientName) {
    client.get('direct_messages/sent', params, function (error, messages, response) {
      var messagesSentArray = [];
      var allMessages;

      if (!error) {
        var messagesSentObject;

        for (var i = 0; i < messages.length; i++) {
          var messageDate = messages[i].created_at;

          messagesSentObject = {
            recipient: false,
            text: messages[i].text,
            name: messages[i].sender.name,
            picture: messages[i].sender.profile_image_url_https,
            created_at: messages[i].created_at,
            date: parseTwitterDate(messageDate, false)
          };
          messagesSentArray.push(messagesSentObject);
        }

        allMessages = messagesReceivedArray.concat(messagesSentArray);

        allMessages.sort(function (a, b) {
          var keyA = new Date(a.created_at);
          var keyB = new Date(b.created_at);
          // Compare the 2 dates
          if (keyA < keyB) return 1;
          if (keyA > keyB) return -1;
          return 0;
        });

        var recipName;

        if (recipientName.length === 1) {
          recipName = recipientName[0];
        } else if (recipientName.length === 2) {
          recipName = recipientName[0] + ', ' + recipientName[1];
        } else if (recipientName.length === 3) {
          recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2];
        } else if (recipientName.length === 4) {
          recipName = recipientName[0] + ', ' + recipientName[1] + ', ' + recipientName[2] + ', ' + recipientName[3];
        }

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
      }
    });
  } // getSentMessages()
}); // router.get()

router.post('/tweet', function (req, res, next) {
  var statusText = req.body.tweet;

  function postNewTweet () {
    var tweetParams = {status: statusText};
    client.post('statuses/update', tweetParams, function (error, tweet, response) {
      if (!error) {
        console.log(tweet);
        res.json({
          'message': 'Successfully sent tweet!',
          'title': tweet.title
        });
      } else {
        console.log(error);
        res.json({
          'message': 'There was an error!',
          'errorMessage': error
        });
      }
    });
  } // postNewTweet()

  postNewTweet();
}); // router.post()

module.exports = router;
