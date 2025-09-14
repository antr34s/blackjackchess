// src/ui/UI.js
export default class UI {
  constructor(controller){
    this.controller = controller;
  }

  bindButtons(){
    $('#hit-btn').click(()=>this.controller.playerHit());
    $('#stand-btn').click(()=>this.controller.playerStand());
    $('#start-btn').click(()=>{
      this.controller.chess.game.reset();
      this.controller.chess.board.start();
      this.controller.chess.updateStatus();
      this.controller.startBlackjack();
    });
  }

  renderBlackjack(hands){
    $('#player-hand').text("Player: " + hands.player.map(c=>c.rank+c.suit).join(' ') +
      " (" + this.controller.blackjack.handValue(hands.player) + ")");
    $('#dealer-hand').text("Dealer: " + hands.dealer.map(c=>c.rank+c.suit).join(' ') +
      " (" + this.controller.blackjack.handValue(hands.dealer) + ")");
  }

  updateStatus(msg){
    $('#status-bar').text(this.controller.chess.updateStatus());
    $('#blackjack-status').text(msg||'');
  }
}