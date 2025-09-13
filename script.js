// Blackjack + Chess integration
// Assumes jQuery, chessboard.js, chess.js already loaded

let board = null;
let game = null;

// Blackjack state
let deck = [];
let playerHand = [];
let dealerHand = [];
let blackjackWinner = null; // "player" | "dealer" | null
let blackjackActive = true; // true while blackjack round is ongoing
let allowedColor = null;    // 'w' or 'b' - which color is allowed to move next

// ---------------- CHESS ----------------
function initChess() {
  game = new Chess();
  board = Chessboard('chessboard', {
    draggable: true,
    position: 'start',
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',

    onDragStart: function(source, piece) {
      if (blackjackActive) return false; // block chess during blackjack
      if (allowedColor && piece[0] !== allowedColor) return false; // only allowed color can move
      if (game.game_over()) return false;
    },

    onDrop: function(source, target) {
        let promotion = 'q';
        const movingPiece = game.get(source);
        if (movingPiece && movingPiece.type === 'p' && (target[1] === '8' || target[1] === '1')) {
            promotion = prompt("Promote to (q,r,b,n)","q");
            if(!['q','r','b','n'].includes(promotion)) promotion='q';
        }

        const move = game.move({from: source, to: target, promotion});
        if(move === null) return 'snapback';

        updateStatus();

        // Only start next blackjack round if allowedColor just moved
        if (allowedColor) {
            allowedColor = null;
            startBlackjack();
        }
        },

        onSnapEnd: function() {
        // Only snap back if move was invalid
        board.position(game.fen());
        }
  });

  updateStatus();
}

function setChessTurn(color) {
  // Force chess.js turn to the given color safely
  const fenParts = game.fen().split(' ');
  fenParts[1] = color; // 'w' or 'b'
  fenParts[3] = '-';   // reset en passant square to prevent illegal FEN issues
  game.load(fenParts.join(' '));
  board.position(game.fen());
  updateStatus();
}

function unlockChessMoves() {
  blackjackActive = false;
}

function updateStatus() {
  let status = '';
  let moveColor = (game.turn() === 'w') ? 'White' : 'Black';
  if (game.in_checkmate()) status = 'Game over, ' + moveColor + ' is in checkmate.';
  else if (game.in_draw()) status = 'Game over, drawn position.';
  else if (game.in_stalemate()) status = 'Game over, stalemate.';
  else status = moveColor + ' to move' + (game.in_check() ? ', ' + moveColor + ' is in check' : '');
  $('#status-bar').text(status);
}

// ---------------- BLACKJACK ----------------
function startBlackjack() {
  blackjackActive = true;
  blackjackWinner = null;

  deck = createDeck();
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];

  renderBlackjack();
  $('#blackjack-status').text("Blackjack: play your round (Hit/Stand).");
  $('#hit-btn').prop('disabled', false);
  $('#stand-btn').prop('disabled', false);
}

function createDeck() {
  const suits=['♠','♥','♦','♣'], ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  let d=[];
  for(let s of suits) for(let r of ranks) d.push({suit:s, rank:r});
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]];}
  return d;
}

function drawCard(){return deck.pop();}

function handValue(hand){
  let total=0, aces=0;
  for(let c of hand){
    if(['J','Q','K'].includes(c.rank)) total+=10;
    else if(c.rank==='A'){total+=11; aces++;}
    else total+=parseInt(c.rank,10);
  }
  while(total>21 && aces>0){total-=10; aces--;}
  return total;
}

function renderBlackjack(){
  $('#player-hand').text("Player: "+playerHand.map(c=>c.rank+c.suit).join(' ')+" ("+handValue(playerHand)+")");
  $('#dealer-hand').text("Dealer: "+dealerHand.map(c=>c.rank+c.suit).join(' ')+" ("+handValue(dealerHand)+")");
}

function playerHit(){
  if(!blackjackActive || blackjackWinner) return;
  playerHand.push(drawCard());
  renderBlackjack();
  if(handValue(playerHand) > 21) endBlackjack('dealer');
}

function playerStand(){
  if(!blackjackActive || blackjackWinner) return;
  dealerPlay();
}

function dealerPlay(){
  while(handValue(dealerHand)<17) dealerHand.push(drawCard());
  renderBlackjack();
  const p = handValue(playerHand), d = handValue(dealerHand);
  if(p > 21) endBlackjack('dealer');
  else if(d > 21) endBlackjack('player');
  else if(p > d) endBlackjack('player');
  else endBlackjack('dealer');
}

function endBlackjack(winner){
  blackjackWinner = winner;
  blackjackActive = false;
  renderBlackjack();

  // Set allowed chess color to move
  allowedColor = (winner === 'player') ? 'w' : 'b';
  setChessTurn(allowedColor);

  const msg = (winner === 'player') ?
    "Player won the blackjack round — White plays next in chess." :
    "Dealer won the blackjack round — Black plays next in chess.";

  setTimeout(()=>{
    alert(msg);
    unlockChessMoves();
    $('#blackjack-status').text(msg);
  }, 1000);
}

// ---------------- INIT ----------------
$(document).ready(function(){
  initChess();
  startBlackjack();

  $('#hit-btn').click(playerHit);
  $('#stand-btn').click(playerStand);
  $('#start-btn').click(function(){
    game.reset();
    board.start();
    updateStatus();
    startBlackjack();
  });
});