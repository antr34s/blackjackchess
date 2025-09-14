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