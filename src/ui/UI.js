// src/ui/UI.js
export default class UI {
  constructor(controller){
    this.controller = controller;
  }

  bindButtons(){
     $('#mode-multiplayer').click(() => {
        this.controller.setMode("multi");
    });

    $('#mode-bot').click(() => {
        const skill = parseInt($('#bot-skill').val(), 10);
        this.controller.setMode("bot", skill);
    });
    $('#hit-btn').click(()=>this.controller.playerHit());
    $('#stand-btn').click(()=>this.controller.playerStand());
    $('#start-btn').click(() => {
        const vsBot = $('#bot-toggle').is(':checked');
        const difficulty = parseInt($('#difficulty-select').val(), 10);

        this.controller.vsBot = vsBot;
        this.controller.botDifficulty = difficulty;

        if (vsBot) {
            this.controller.bot = new ChessBot(difficulty);
        } else {
            this.controller.bot = null;
        }

        this.controller.chess.game.reset();
        this.controller.chess.board.start();
        this.controller.chess.updateStatus();
        this.controller.startBlackjack();
    });
    $('#difficulty').change((e)=>{
        this.controller.bot.setDifficulty(e.target.value);
    });
    $('#bot-toggle').change(function() {
        const botEnabled = $(this).is(':checked');
        $('#difficulty-select').prop('disabled', !botEnabled);
    });

  }

  renderBlackjack(hands){
    const bj = this.controller.blackjack;

    // Player hand
    const playerDisplay = bj.playerHand.slice(0, bj.visiblePlayerCards)
                            .map(c=>c.rank+c.suit).join(' ');
    const playerValue = bj.handValue(bj.playerHand, bj.visiblePlayerCards);
    $('#player-hand').text(`Player: ${playerDisplay} (${playerValue})`);

    // Dealer hand
    const dealerDisplay = bj.dealerHand.map((c,i)=>{
        return i < bj.visibleDealerCards ? (c.rank+c.suit) : '??';
    }).join(' ');
    const dealerValue = (bj.visibleDealerCards === bj.dealerHand.length)
                        ? bj.handValue(bj.dealerHand)
                        : '?';
    $('#dealer-hand').text(`Dealer: ${dealerDisplay} (${dealerValue})`);
    }

  updateStatus(msg){
    $('#status-bar').text(this.controller.chess.updateStatus());
    $('#blackjack-status').text(msg||'');
  }
}