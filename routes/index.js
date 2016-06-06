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
  // res.render('index');

  var params = {screen_name: 'chrissgaona', count: 5};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    var tweetsArray = [];
    var username;

    if (!error) {
      // console.log(tweets);
      // res.send(tweets);
      var tweetsObject;
      for (var i = 0; i < tweets.length; i++) {
        var date = tweets[i].created_at.split(' ');
        // console.log(date);

        if (tweets[i].retweeted_status !== undefined) {
        tweetsObject = {
          created_at: date[1] + ' ' + date[2],
          profile_image: tweets[i].user.profile_image_url_https,
          name: tweets[i].user.name,
          screen_name: tweets[i].user.screen_name,
          text: tweets[i].retweeted_status.text,
          retweet_count: tweets[i].retweeted_status.retweet_count,
          favorite_count: tweets[i].retweeted_status.favorite_count,
          friends_count: tweets[i].user.friends_count
        };
      } else {
        tweetsObject = {
          created_at: date[1] + ' ' + date[2],
          profile_image: tweets[i].user.profile_image_url_https,
          name: tweets[i].user.name,
          screen_name: tweets[i].user.screen_name,
          text: tweets[i].text,
          retweet_count: tweets[i].retweet_count,
          favorite_count: tweets[i].favorite_count,
          friends_count: tweets[i].user.friends_count
        };
      }
        tweetsArray.push(tweetsObject);
      }

      getFriends(tweetsObject, tweetsArray);

      // console.log(tweetsArray);
    }
  });

  function getFriends(tweetsObject, tweetsArray) {
    client.get('friends/list', params, function(error, friends, response) {
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
        console.log(friendsArray);
      }
      console.log('Following: ' + tweetsObject.friends_count);

      // getMessages();

      res.render('index', {
        username: tweetsObject.screen_name,
        following: tweetsObject.friends_count,
        tweets: tweetsArray,
        friends: friendsArray
      });
    });
  }

  // function getMessages() {
  //   client.get('direct_messages', params, function(error, messages, response){
  //     if (!error) {
  //       console.log(messages);
  //     }
  //   });
  // }

});

module.exports = router;
