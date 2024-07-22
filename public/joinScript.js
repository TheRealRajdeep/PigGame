"use strict";

const socket = io();

const joinGameBtn = document.querySelector(".join-game");
const playerNameInput = document.querySelector(".player-name");

// Check if there's an invite code in the URL
console.log(window.location.href.split("/").pop());
const inviteCode = window.location.href.split("/").pop();

console.log(inviteCode);

joinGameBtn.addEventListener("click", function () {
  const name = playerNameInput.value;
  if (name) {
    socket.emit("joinGame", inviteCode, name);
  } else {
    alert("Please enter your name");
  }
});

socket.on("gameStart", (data) => {
  console.log("Game started!", data);
  const player = playerNameInput.value;
  window.location.href = `/game.html?creator=${data.creator}&opponent=${data.opponent}&player=${player}&inviteCode=${inviteCode}`;
});

socket.on("joinError", (message) => {
  alert(message);
});
