export default class BlackjackGame {
  deck = [];
  playerHand = [];
  dealerHand = [];
  winner = null;
  playerDone = false;
  dealerDone = false;

  // Track visible cards
  visiblePlayerCards = 2;
  visibleDealerCards = 1;

  constructor() { this.reset(); }

  reset() {
    this.deck = this.createDeck();
    this.playerHand = [this.drawCard(), this.drawCard()];
    this.dealerHand = [this.drawCard(), this.drawCard()];
    this.winner = null;
    this.playerDone = false;
    this.dealerDone = false;
    this.visiblePlayerCards = 2;
    this.visibleDealerCards = 1;
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

  handValue(hand, visibleCount = hand.length){
    let total = 0, aces = 0;
    for(let i=0; i<visibleCount && i<hand.length; i++){
      const c = hand[i];
      if(['J','Q','K'].includes(c.rank)) total+=10;
      else if(c.rank==='A'){ total+=11; aces++; }
      else total+=parseInt(c.rank,10);
    }
    while(total>21 && aces>0){ total-=10; aces--; }
    return total;
  }

  playerHit(){
    this.playerHand.push(this.drawCard());
    this.visiblePlayerCards++; // reveal the new card immediately

    const playerTotal = this.handValue(this.playerHand, this.visiblePlayerCards);
    const dealerTotal = this.handValue(this.dealerHand, this.visibleDealerCards);

    if(playerTotal > 21){
      if(dealerTotal > 21){
        this.winner = 'draw';
      } else {
        this.winner = 'dealer';
      }
      this.playerDone = true;
      this.dealerDone = true;
      this.visibleDealerCards = this.dealerHand.length; // reveal all dealer cards
    }
  }

  playerStand(){
    this.playerDone = true;

    // Reveal dealer's hidden card
    this.visibleDealerCards = this.dealerHand.length;

    while(this.handValue(this.dealerHand, this.visibleDealerCards) < 17){
      this.dealerHand.push(this.drawCard());
      this.visibleDealerCards = this.dealerHand.length; // reveal each dealer card immediately
    }

    this.dealerDone = true;

    const p = this.handValue(this.playerHand, this.visiblePlayerCards);
    const d = this.handValue(this.dealerHand, this.visibleDealerCards);

    if(p>21 && d>21) this.winner = 'draw';
    else if(p>21) this.winner = 'dealer';
    else if(d>21) this.winner = 'player';
    else if(p===d) this.winner = 'draw';
    else this.winner = (p>d)?'player':'dealer';
  }

  getHands(){
    // Return the cards that should currently be visible
    return {
      player: this.playerHand.slice(0, this.visiblePlayerCards),
      dealer: this.dealerHand.slice(0, this.visibleDealerCards)
    };
  }

  getFullHands(){
    // Return all cards for final reveal
    return {
      player: this.playerHand,
      dealer: this.dealerHand
    };
  }
}