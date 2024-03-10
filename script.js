'use strict';

// Selecting elements
const score0El = document.querySelector("#score--0");
const score1El = document.getElementById("score--1");
const diceEl = document.querySelector(".dice");
const btnNew = document.querySelector(".btn--new");
const btnRoll = document.querySelector(".btn--roll");
const btnHold = document.querySelector(".btn--hold");
const current0El = document.getElementById("current--0");
const current1El = document.getElementById("current--1");
const player0El = document.querySelector(".player--0");
const player1El = document.querySelector(".player--1");
// Starting Conditions

const scores = [0, 0];
score0El.textContent = 0;
score1El.textContent = 0;
diceEl.classList.add("hidden");
let currentScore = 0;
let activePlayer = 0;
let playing = true;
function switchPlayer() {
    currentScore = 0;
            document.getElementById(`current--${activePlayer}`).textContent = 0;
             activePlayer = activePlayer === 0 ? 1 : 0;
             player0El.classList.toggle("player--active");
             player1El.classList.toggle("player--active");
}

//rolling dice functionality
btnRoll.addEventListener("click", function() {
    if(playing) {
    
    // 1. Generate a random dice roll
    const dice = Math.trunc(Math.random() * 6) + 1;

    //2. Display dice roll
    diceEl.classList.remove("hidden");
    diceEl.src = `dice-${dice}.png`;

    //3. check whether it is a 1 or not: if true change player.
    if(dice != 1) {
        // Add dice to current score
        currentScore = currentScore + dice;
        document.getElementById(`current--${activePlayer}`).textContent = currentScore;
        
    }
    else {
        // switch to next player
            switchPlayer();
    }
}
})

    // Hold button functionality 

    btnHold.addEventListener("click", function() {
        if(playing) {
        // 1. current score becomes the total player score
        scores[activePlayer] += currentScore;
        console.log(scores);
         document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];
        // 2. check whether score >= 100
        // finish the game
        if(scores[activePlayer] >= 100) {
            document.querySelector(`.player--${activePlayer}`).classList.add("player--winner");
            document.querySelector(`.player--${activePlayer}`).classList.remove("player--active");
            diceEl.classList.add("hidden");
            playing = false;
        }
        //switch player
        else{
            switchPlayer();
        }  
    }  
    })
    btnNew.addEventListener("click", function() {
        location.reload();
    })

