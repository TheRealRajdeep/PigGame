"use strict";

const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const creator = urlParams.get("creator");
const opponent = urlParams.get("opponent");
const inviteCode = urlParams.get("inviteCode");

if (inviteCode) {
  socket.emit("rejoin", { inviteCode });
}

if (creator && opponent) {
  document.getElementById("name--0").textContent = creator;
  document.getElementById("name--1").textContent = opponent;
}

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

let scores = [0, 0];
score0El.textContent = 0;
score1El.textContent = 0;
diceEl.classList.add("hidden");
let currentScore = 0;
let activePlayer = 0;
let playing = true;

function initGame() {
  console.log("Game Initialized");
  scores[0] = 0;
  scores[1] = 99;
  currentScore = 0;
  activePlayer = 0;
  playing = true;
  btnNew.classList.add("hidden");
  score0El.textContent = 0;
  score1El.textContent = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;

  diceEl.classList.add("hidden");
  player0El.classList.add("player--active");
  player1El.classList.remove("player--active");
  player0El.classList.remove("player--winner");
  player1El.classList.remove("player--winner");
}

initGame();

function switchPlayer() {
  player0El.classList.toggle("player--active");
  player1El.classList.toggle("player--active");
}

function updatedUI(data) {
  // Show the dice
  diceEl.classList.remove("hidden");

  if (data.type === "roll") {
    // Dice was rolled
    if (data.dice === 1) {
      // If dice is 1, switch player.
      diceEl.src = `dice-img/dice-${data.dice}.png`;
      document.getElementById(
        `current--${Number(!data.activePlayer)}`
      ).textContent = data.currentScore;
      switchPlayer();
    } else {
      document.getElementById(`current--${data.activePlayer}`).textContent =
        data.currentScore;
      diceEl.src = `dice-img/dice-${data.dice}.png`;
    }
  } else if (data.type === "hold") {
    // Player clicked on hold.
    scores = data.scores;
    console.log("Scores", scores);
    console.log("Active player", !data.activePlayer);
    console.log("Score of active player", scores[!data.activePlayer]);
    document.getElementById(
      `score--${Number(!data.activePlayer)}`
    ).textContent = scores[Number(!data.activePlayer)];
    document.getElementById(
      `current--${Number(!data.activePlayer)}`
    ).textContent = data.currentScore;

    switchPlayer();
  }
}
//rolling dice functionality
btnRoll.addEventListener("click", function () {
  const params = new URLSearchParams(window.location.search);
  let currentPlayer = params.get("player");
  console.log("We rolled");

  console.log(playing);
  if (playing) {
    socket.emit("playerMove", {
      inviteCode,
      player: currentPlayer,
      type: "roll",
    });
  }
});
const diceSound = new Audio("audio/dice-sound.mp3");
socket.on("diceRolled", (data) => {
  console.log("Dice was rolled");
  const { dice, currentScore, activePlayer } = data;
  // Update UI based on the received dice roll
  diceSound.play();
  updatedUI(data);
  if (dice === 1) {
    switchPlayer();
  }
});

// Hold button functionality
const holdSound = new Audio("audio/hold-sound.mp3");
btnHold.addEventListener("click", function () {
  if (playing) {
    // 1. current score becomes the total player score
    // const moveData = {
    //   inviteCode,
    //   type: "hold",
    //   scores,
    //   activePlayer,
    //   currentScore,
    // };

    // updatedUI(moveData);
    const params = new URLSearchParams(window.location.search);
    let currentPlayer = params.get("player");
    socket.emit("playerMove", {
      inviteCode,
      player: currentPlayer,
      type: "hold",
    });
  }
});

btnNew.addEventListener("click", function () {
  const params = new URLSearchParams(window.location.search);
  let currentPlayer = params.get("player");
  socket.emit("playerMove", {
    inviteCode,
    player: currentPlayer,
    type: "newGame",
  });
});

socket.on("gameStateChanged", (data) => {
  switch (data.type) {
    case "roll":
      const diceSound = new Audio("audio/dice-sound.mp3");
      diceSound.play();
      updatedUI(data);
      break;
    case "hold":
      const holdSound = new Audio("audio/hold-sound.mp3");
      holdSound.play();
      updatedUI(data);
      break;
    case "newGame":
      initGame();
      break;
  }
});

socket.on("gameOver", (data) => {
  playing = false;

  const { scores, winnerIndex } = data;

  console.log(document.getElementById(`score--${winnerIndex}`));

  document.getElementById(`score--${winnerIndex}`).textContent =
    scores[winnerIndex];

  document.getElementById(`current--${winnerIndex}`).textContent =
    data.currentScore;

  document
    .querySelector(`.player--${winnerIndex}`)
    .classList.add("player--winner");
  document
    .querySelector(`.player--${winnerIndex}`)
    .classList.remove("player--active");
  diceEl.classList.add("hidden");
  btnNew.classList.remove("hidden");
});

socket.emit("joinGame", inviteCode, creator || opponent);
