'use strict';

var parseTwitterDate = require('./parseDate.js');

module.exports = function(tweets) {
  // defines needed variables
  var tweetsArray = [];
  var profileImage;
  var backgroundImage;

  var tweetsObject;

  // creates for loop through tweets response from
  // twitter API
  for (var i = 0; i < tweets.length; i++) {
    profileImage = tweets[i].user.profile_image_url_https;
    backgroundImage = tweets[i].user.profile_banner_url;

    // if tweet has been retweeted use the following
    // object
    if (tweets[i].retweeted_status !== undefined) {
      /**
      * Recent 5 tweets of user
      * @name tweets object
      */
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

  // console.log(tweetsArray);
  return { tweets: tweetsArray, tweetsObject: tweetsObject, profileImage: profileImage, backgroundImage: backgroundImage };
};
