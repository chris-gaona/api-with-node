$(function() {
  'use strict';

  function countChar(val) {
    $('#tweet-char').text(140 - val);
  }

  $('#tweet-textarea').on('keyup', function() {
    countChar($(this).val().length);
  });

  $('button.button-primary').on('click', function() {
    var tweetText = $('#tweet-textarea').val();

    $.ajax({
      type: "POST",
      url: "/tweet",
      timeout: 2000,
      data: {tweet: tweetText},
      success: function(response) {
        //if there is a response on the ajax request
        if (response) {
          console.log(response);

          var prependText = '<li><strong class="app--tweet--timestamp">Just Now</strong><a class="app--tweet--author"><div class="app--avatar" style="background-image: url(' + response.image + ')"><img src="' + response.image + '"></div><h4>' + response.name + '</h4> @' + response.username + '</a><p>' + response.text + '</p><ul class="app--tweet--actions circle--list--inline"><li><a class="app--reply"><span class="tooltip">Reply</span><img class="inject-me" src="images/reply.svg"></a></li><li><a class="app--repeat"><span class="tooltip">Retweet</span><img class="inject-me" src="images/retweet.svg"><strong>' + ' ' + response.retweet + '</strong></a></li><li><a class="app--like"><span class="tooltip">Like</span><img class="inject-me" src="images/like.svg"><strong>' + ' ' + response.like + '</strong></a></li></ul></li>';

          $('ul.app--tweet--list').prepend(prependText);

          // Elements to inject
          var mySVGsToInject = document.querySelectorAll('img.inject-me');

          // Do the injection
          SVGInjector(mySVGsToInject);

          $('#tweet-textarea').val('');

        } else {
          console.warn('there was an issue');
        } //if statement

      },
      error: function() {
        //show error message

      } //error function
    }); //end $.ajax

    //Very important line, it disables the page refresh.
    return false;

  });

});
