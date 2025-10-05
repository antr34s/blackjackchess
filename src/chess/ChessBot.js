// ChessBot.js
export default class ChessBot {
  constructor(skillLevel = 10) {
    this.engine = new Worker("./libs/stockfish/stockfish-17.1-lite-single-03e3232.js");
    this.skillLevel = skillLevel;

    // Queue to handle async responses
    this.pending = [];

    this.engine.onmessage = (event) => {
      const line = event.data;
      // Stockfish sends bestmove line when done
      if (line.startsWith("bestmove")) {
        const move = line.split(" ")[1];
        if (this.pending.length) {
          const cb = this.pending.shift();
          cb(move);
        }
      }
    };

    // configure engine skill level
    this.send(`setoption name Skill Level value ${this.skillLevel}`);
  }

  send(cmd) {
    this.engine.postMessage(cmd);
  }

  /**
   * Get a move suggestion from Stockfish
   * @param {string} fen - Current board position
   * @param {number} depth - Search depth
   * @returns {Promise<string>} move like 'e2e4'
   */
  getMove(fen, depth = 12) {
    return new Promise((resolve) => {
      this.pending.push(resolve);
      this.send("ucinewgame");
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }
}
