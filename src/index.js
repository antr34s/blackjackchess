// src/index.js
import GameController from "./controller/GameController.js";

let controller = null;

$(document).ready(() => {
  $('#difficulty-select').prop('disabled', true);

  // Enable difficulty select only when bot is chosen
  $('#bot-toggle').change(function () {
    const botEnabled = $(this).is(':checked');
    $('#difficulty-select').prop('disabled', !botEnabled);
  });

  // When the user presses start game
  $('#start-game-btn').click(() => {
    const vsBot = $('#bot-toggle').is(':checked');
    const difficulty = parseInt($('#difficulty-select').val(), 10);

    // hide controls, show game area
    $('#mode-controls').hide();
    $('#game-area').show();

    // create controller AFTER selecting mode
    controller = new GameController(vsBot, difficulty);
  });
});