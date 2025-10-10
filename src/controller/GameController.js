// src/controller/GameController.js
import ChessGame from '../chess/ChessGame.js';
import ChessBot from '../chess/ChessBot.js';
import BlackjackGame from '../blackjack/BlackjackGame.js';
import UI from '../ui/UI.js';

export default class GameController {
  constructor(vsBot = false, botDifficulty = 10) {
    this.vsBot = vsBot;
    this.botDifficulty = botDifficulty;
    this.bot = vsBot ? new ChessBot(botDifficulty) : null;

    this.chess = new ChessGame('chessboard', 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png');
    this.blackjack = new BlackjackGame();
    this.ui = new UI(this);

    this.allowedColor = null;
    this.blackjackActive = true;

    // 🔥 When chess move finishes → restart blackjack or trigger bot move
    this.chess.setOnMoveEnd(async () => {
        // If just finished a move and Blackjack not active → start a new blackjack round
        if (!this.blackjackActive) {
            this.startBlackjack();
            return;
        }

        // 🧠 If playing vs bot and it's now the bot's turn → let Stockfish move
        if (this.vsBot && this.bot && this.chess.turn === 'b') {
            const fen = this.chess.fen;
            const move = await this.bot.getMove(fen);
            this.chess.makeMove(move.slice(0, 2), move.slice(2, 4));
        }
    });

    this.ui.bindButtons();
    this.startBlackjack();
  }

  startBlackjack(){
    this.blackjack.reset();
    this.blackjackActive = true;
    this.chess.lockChess(); // block chess during blackjack
    this.ui.renderBlackjack(this.blackjack.getHands());
    this.ui.updateStatus("Blackjack: play your round (Hit/Stand).");
    }

    endBlackjack(winner) {
        if (winner === 'draw') {
            this.ui.updateStatus("Draw! Replay the round to decide whose turn.");
            setTimeout(() => this.startBlackjack(), 500);
            return;
        }

        // BEFORE changing the chess turn: capture current "side to move" & check state
        const defenderBefore = this.chess.game.turn();    // 'w' or 'b' (side that would move now)
        const wasInCheckBefore = this.chess.game.in_check(); // true if defenderBefore is in check

        this.blackjackActive = false;
        this.chess.unlockChess();

        const winnerColor = (winner === 'player') ? 'w' : 'b';
        const msg = (winner === 'player') ? "Player won — White plays next" : "Dealer won — Black plays next";

        // If defender was in check and the winner is the attacker, try forced capture immediately
        if (wasInCheckBefore && winnerColor !== defenderBefore) {
            console.log("sljl");
            const captured = this.chess.autoCaptureKing(winnerColor);
            if (captured) {
            // King removed → immediate end of game
            this.ui.updateStatus(`${winnerColor === 'w' ? 'White' : 'Black'} captured the king!`);
            // small delay so UI updates (cards / board) render before the alert
            setTimeout(() => {
                alert(`${winnerColor === 'w' ? 'White' : 'Black'} captured the King — game over!`);
            }, 200);
            // lock the board - game over
            this.chess.lockChess();
            return;
            }
            // if autoCaptureKing returned false -> attacker cannot legally capture the king, fallthrough
        }

        // normal flow: allow winner to move next
        this.chess.setAllowedColor(winnerColor);
        this.chess.setTurn(winnerColor);

        // show message after board has updated
        this.ui.updateStatus(msg);
        setTimeout(() => { alert(msg); }, 400);

        // If dealer won and we're vs bot, ask bot to play now
        if (winner === 'dealer' && this.vsBot && this.bot) {
            setTimeout(async () => {
            const fen = this.chess.fen;
            const move = await this.bot.getMove(fen);
            this.chess.makeMove(move.slice(0,2), move.slice(2,4));
            }, 700);
        }
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