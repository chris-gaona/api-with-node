/** A module. Its name is module:router.
 * @module friendsInfo
 */

'use strict';

/**
* Gets friends info for user from Twitter api
* @function getfriendsInfo
* @param {object} friends - friends object sent in response from twitter api
* @returns {array} array of 5 most recent friends
*/
module.exports = function (friends) {
  // define needed variables
  var friendsArray = [];

  // if there is no error...
  var friendsObject;

  // for loop through the friends
  for (var i = 0; i < friends.users.length; i++) {
    /**
    * Recent 5 friends of user on twitter
    * @name friends object
    */
    friendsObject = {
      profile_image: friends.users[i].profile_image_url_https,
      name: friends.users[i].name,
      screen_name: friends.users[i].screen_name
    };
    friendsArray.push(friendsObject);
  }
  // returns array of most recent 5 friends user is following
  return friendsArray;
};
