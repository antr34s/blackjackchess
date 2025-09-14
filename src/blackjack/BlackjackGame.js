// src/blackjack/BlackjackGame.js
export default class BlackjackGame {
  deck = [];
  playerHand = [];
  dealerHand = [];
  winner = null;

  constructor() { this.reset(); }

  reset() {
    this.deck = this.createDeck();
    this.playerHand = [this.drawCard(), this.drawCard()];
    this.dealerHand = [this.drawCard(), this.drawCard()];
    this.winner = null;
  }

  createDeck() {
    const suits = ['♠','♥','♦','♣'], ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    let deck = [];
    for (let s of suits) for (let r of ranks) deck.push({suit:s, rank:r});
    for (let i = deck.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  drawCard(){ return this.deck.pop(); }

  handValue(hand){
    let total=0, aces=0;
    for(let c of hand){
      if(['J','Q','K'].includes(c.rank)) total+=10;
      else if(c.rank==='A'){total+=11; aces++;}
      else total+=parseInt(c.rank,10);
    }
    while(total>21 && aces>0){ total-=10; aces--; }
    return total;
  }

  playerHit(){
    this.playerHand.push(this.drawCard());
    if(this.handValue(this.playerHand) > 21) this.winner = 'dealer';
  }

  playerStand(){
    while(this.handValue(this.dealerHand)<17) this.dealerHand.push(this.drawCard());
    const p = this.handValue(this.playerHand), d = this.handValue(this.dealerHand);
    if(p>21) this.winner='dealer';
    else if(d>21) this.winner='player';
    else this.winner = (p>d)?'player':'dealer';
  }

  getHands(){ return {player:this.playerHand, dealer:this.dealerHand}; }
}