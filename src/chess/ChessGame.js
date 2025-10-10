// src/chess/ChessGame.js
export default class ChessGame {
  #board = null;
  #game = null;
  #allowedColor = null;

  constructor(boardId, pieceTheme) {
    this.#board = Chessboard(boardId, {
      draggable: true,
      position: 'start',
      pieceTheme: pieceTheme,
      onDragStart: this.onDragStart.bind(this),
      onDrop: this.onDrop.bind(this),
      onSnapEnd: this.onSnapEnd.bind(this)
    });
    this.#game = new Chess();
    this.lastMoveMade = false;
  }

  onDragStart(source, piece) {
    // If Blackjack still active → block all moves
    if (this.blackjackLock) return false;

    // Only let the winner's color move
    if (this.#allowedColor && piece[0] !== this.#allowedColor) return false;

    if (this.#game.game_over()) return false;
  }

  onDrop(source, target) {
    let promotion = 'q';
    const movingPiece = this.#game.get(source);

    if (movingPiece && movingPiece.type === 'p' && (target[1] === '8' || target[1] === '1')) {
      promotion = prompt("Promote to (q,r,b,n)", "q");
      if (!['q','r','b','n'].includes(promotion)) promotion='q';
    }

    const move = this.#game.move({ from: source, to: target, promotion });
    if (move === null) return 'snapback';

    this.lastMoveMade = true;

    // 🔥 Trigger controller callback
    if (this.onMoveEnd) this.onMoveEnd();

    return move;
  }

  onSnapEnd() {
    this.#board.position(this.#game.fen());
  }

  setTurn(color) {
    const fenParts = this.#game.fen().split(' ');
    fenParts[1] = color;
    fenParts[3] = '-';
    this.#game.load(fenParts.join(' '));
    this.#board.position(this.#game.fen());
  }

  get fen() { return this.#game.fen(); }
  get turn() { return this.#game.turn(); }
  get board() { return this.#board; }
  get game() { return this.#game; }

  updateStatus() {
    let status = '';
    let moveColor = (this.#game.turn() === 'w') ? 'White' : 'Black';
    if (this.#game.in_checkmate()) status = 'Game over, ' + moveColor + ' is in checkmate.';
    else if (this.#game.in_draw()) status = 'Game over, drawn position.';
    else if (this.#game.in_stalemate()) status = 'Game over, stalemate.';
    else status = moveColor + ' to move' + (this.#game.in_check() ? ', ' + moveColor + ' is in check' : '');
    return status;
  }
  setOnMoveEnd(callback) {
    this.onMoveEnd = callback;
  }
  setAllowedColor(color) {
    this.#allowedColor = color; // 'w' or 'b'
  }
  // Apply a normal move programmatically via the Chess object and update board
  makeMove(from, to, promotion = 'q') {
    const m = this.#game.move({ from, to, promotion });
    if (m) {
      this.#board.position(this.#game.fen());
      if (this.onMoveEnd) this.onMoveEnd();
      return true;
    }
    return false;
  }
  isKingInCheck(color) {
    return this.#game.in_check() && this.#game.turn() === color;
  }

  // helper: find king square for a color ('w' or 'b')
  getKingSquare(color) {
    const files = ['a','b','c','d','e','f','g','h'];
    for (let r = 1; r <= 8; r++) {
      for (let f of files) {
        const sq = f + r;
        const p = this.#game.get(sq);
        if (p && p.type === 'k' && p.color === color) return sq;
      }
    }
    return null;
  }

   // Attempt to make the attacker capture the defender's king.
  // Returns true if we performed the forced capture (and updated the board).
  autoCaptureKing(attackerColor) {
    const defenderColor = attackerColor === 'w' ? 'b' : 'w';
    const kingSquare = this.getKingSquare(defenderColor);
    if (!kingSquare) return false;

    // Build a forced FEN where it's attacker's turn (reset en-passant to be safe)
    const fenParts = this.#game.fen().split(' ');
    fenParts[1] = attackerColor;
    fenParts[3] = '-';
    const forcedFen = fenParts.join(' ');

    // Create a temporary Chess instance with the forced turn to see legal attacker moves
    const tmp = new Chess(forcedFen);
    const moves = tmp.moves({ verbose: true });

    // find an attacking move that lands on the king square
    const captureMove = moves.find(m => m.to === kingSquare && m.color === attackerColor);
    if (!captureMove) return false;

    // Apply it to the real game by loading the forced FEN then performing the move.
    // Note: this changes the game state and clears history (acceptable for forced capture).
    this.#game.load(forcedFen);
    this.#game.move({ from: captureMove.from, to: captureMove.to, promotion: captureMove.promotion || 'q' });

    // update visual board
    this.#board.position(this.#game.fen());
    return true;
  }
  lockChess() { this.blackjackLock = true; }
  unlockChess() { this.blackjackLock = false; }
}