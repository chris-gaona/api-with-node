$(function() {
  'use strict';

  function countChar(val) {
    $('#tweet-char').text(140 - val);
  }

  $('#tweet-textarea').on('keyup', function() {
    countChar($(this).val().length);
  });

});
