// Declare variables to hold the chessboard instance and the chess game logic
let board = null;
let game = null;

// Function to initialize the chessboard and chess game
function initChess() {
    // Create a new Chess.js game instance
    game = new Chess();

    // Initialize Chessboard.js board with configuration
    board = Chessboard('chessboard', {
        draggable: true, // Allow pieces to be dragged with the mouse
        position: 'start', // Set initial position to standard chess start
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png', // Use online images for chess pieces

        // Event triggered when a piece is picked up
        onDragStart: function (source, piece, position, orientation) {
            // Prevent dragging if the game is over
            if (game.game_over()) return false;

            // Prevent moving opponent's pieces
            if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
        },

        // Event triggered when a piece is dropped on a square
        onDrop: function (source, target) {
            let promotion = 'q'; // Default promotion piece is queen
            const movingPiece = game.get(source); // Get the piece being moved

            // Check if pawn reaches last rank for promotion
            if (movingPiece && movingPiece.type === 'p' && (target[1] === '8' || target[1] === '1')) {
                // Ask user which piece to promote to
                promotion = prompt("Promote to (q,r,b,n):", "q");
                // Validate user input, default to queen if invalid
                if (!['q','r','b','n'].includes(promotion)) promotion = 'q';
            }

            // Attempt to make the move in Chess.js
            const move = game.move({ from: source, to: target, promotion: promotion });

            // If move is illegal, snap the piece back to its original square
            if (move === null) return 'snapback';

            // Update status text and check for check/checkmate/draw
            updateStatus();

            // Note: We do NOT update the board position here to avoid double-draw UI issue
        },

        // Event triggered after the piece has finished moving (drag animation ends)
        onSnapEnd: function() {
            // Update the board position to match the current game state
            board.position(game.fen());
        }
    });

    // Initialize status display after creating the board
    updateStatus();
}

// Function to update game status display and show alerts for game over
function updateStatus() {
    let status = ''; // Status text to display
    let moveColor = (game.turn() === 'w') ? 'White' : 'Black'; // Determine which player's turn

    // Check for game over conditions
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
        alert(status); // Show popup alert for checkmate
    }
    else if (game.in_draw()) {
        status = 'Game over, drawn position.';
        alert(status); // Show popup alert for draw
    }
    else if (game.in_stalemate()) {
        status = 'Game over, stalemate.';
        alert(status); // Show popup alert for stalemate
    }
    else {
        // Normal turn message
        status = moveColor + ' to move';
        // If current player is in check, append warning
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check';
        }
    }

    // Update the status-bar div with current status text
    $('#status-bar').text(status);
}

// Function to reset the game and chessboard to initial state
function resetGame() {
    game.reset(); // Reset Chess.js game state
    board.start(); // Reset Chessboard.js board visually
    updateStatus(); // Update status text for new game
}

// Wait until the DOM is fully loaded before initializing chess
$(document).ready(function() {
    initChess(); // Initialize chessboard and game

    // Bind click event to the Start/Reset button
    $('#start-btn').click(function(){
        resetGame(); // Reset game when button is clicked
    });
});