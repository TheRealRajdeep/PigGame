"use strict";

const socket = io();

const joinGameBtn = document.querySelector(".join-game");
const playerNameInput = document.querySelector(".player-name");

// Check if there's an invite code in the URL
console.log(window.location.href.split("/").pop());
const inviteCode = window.location.href.split("/").pop();

console.log(inviteCode);

// Remove the 'DOMContentLoaded' event listener
// It is not necessary as the script is placed at the end of the HTML body
// and the elements it references are already present in the DOM

joinGameBtn.addEventListener("click", function () {
  const name = playerNameInput.value;
  if (name) {
    socket.emit("joinGame", inviteCode, name);
  } else {
    alert("Please enter your name");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const howToPlayBtn = document.getElementById("how-to-play-btn");
  const rulesContainer = document.getElementById("rules-container");
  const closeRulesBtn = document.getElementById("close-rules-btn");

  howToPlayBtn.addEventListener("click", function () {
    rulesContainer.classList.remove("hidden");
  });

  closeRulesBtn.addEventListener("click", function () {
    rulesContainer.classList.add("hidden");
  });
});
socket.on("gameStart", (data) => {
  console.log("Game started!", data);
  const player = playerNameInput.value;
  window.location.href = `/game.html?creator=${data.creator}&opponent=${data.opponent}&player=${player}&inviteCode=${inviteCode}`;
});

socket.on("joinError", (message) => {
  alert(message);
});
