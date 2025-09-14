// src/controller/GameController.js
import ChessGame from '../chess/ChessGame.js';
import BlackjackGame from '../blackjack/BlackjackGame.js';
import UI from '../ui/UI.js';

export default class GameController {
  constructor() {
    this.chess = new ChessGame('chessboard', 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png');
    this.blackjack = new BlackjackGame();
    this.ui = new UI(this);

    this.allowedColor = null;
    this.blackjackActive = true;

    // 🔥 When chess move finishes → restart blackjack
    this.chess.setOnMoveEnd(() => {
        if (!this.blackjackActive) {
        this.startBlackjack();
        }
    });

    this.ui.bindButtons();
    this.startBlackjack();
    }

  startBlackjack(){
    this.blackjack.reset();
    this.blackjackActive = true;
    this.chess.lockChess(); // 🔒 block chess during blackjack
    this.ui.renderBlackjack(this.blackjack.getHands());
    this.ui.updateStatus("Blackjack: play your round (Hit/Stand).");
    }

endBlackjack(winner){
  this.blackjackActive = false;
  this.allowedColor = (winner==='player') ? 'w' : 'b';

  this.chess.setTurn(this.allowedColor);
  this.chess.setAllowedColor(this.allowedColor);
  this.chess.unlockChess(); // 🔓 unlock only after Blackjack ends

  const msg = winner==='player'
    ? "Player won — White plays next"
    : "Dealer won — Black plays next";

  setTimeout(()=>{ alert(msg); this.ui.updateStatus(msg); }, 500);
}

  playerHit(){
    if(!this.blackjackActive) return;
    this.blackjack.playerHit();
    this.ui.renderBlackjack(this.blackjack.getHands());
    if(this.blackjack.winner) this.endBlackjack(this.blackjack.winner);
  }

  playerStand(){
    if(!this.blackjackActive) return;
    this.blackjack.playerStand();
    this.ui.renderBlackjack(this.blackjack.getHands());
    if(this.blackjack.winner) this.endBlackjack(this.blackjack.winner);
  }
 
}