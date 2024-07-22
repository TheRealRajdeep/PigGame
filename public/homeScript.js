"use strict";
const socket = io();
const joinGameBtn = document.querySelector(".join-game");

const createGame = document.querySelector(".create-game");
const playerName = document.querySelector(".player-name");
const homeContainer = document.querySelector(".home-container");
const welcome = document.querySelector(".welcome");

let invite = Math.floor(1000 + Math.random() * 9000);

createGame.addEventListener("click", function () {
  const name = playerName.value;
  if (name !== "") {
    socket.emit("createGame", name, invite.toString());
    playerName.style.display = "none";
    createGame.style.display = "none";

    if (welcome) {
      welcome.innerText = `Welcome ${name}`;
    }

    homeContainer.innerHTML = `
  <h2>Waiting for other player to join...</h2>
  <p>Share this link with your friend to start the game</p>
  <div style="display:flex; gap: 10px;" class="session-link-container">
    <p class = "session-link">https://piggame-production.up.railway.app/join/${invite}</p>
    <button class="copy-link" id = "clipboard" style = "width: 30px; height: 30px; margin-top: 12px;"><i class="fas fa-clipboard"></i></button>
  </div>
  `;
    const copyLink = homeContainer.querySelector(".copy-link");
    copyLink.addEventListener("click", function () {
      const sessionLink = document.querySelector(".session-link");
      navigator.clipboard.writeText(sessionLink.innerText);
      //remove clipboard icon and add tick icon
      const tickIcon = document.createElement("i");
      tickIcon.classList.add("fas", "fa-check");
      copyLink.innerHTML = "";
      copyLink.appendChild(tickIcon);
      return invite;
    });
  } else {
    alert("Please enter you name");
  }
});

socket.on("gameStart", (data) => {
  console.log("Game started", data);
  window.location.href = `/game.html?creator=${data.creator}&opponent=${data.opponent}&player=${data.creator}&inviteCode=${invite}`;
  isMyTurn = data.currentTurn === data.creator;
});

socket.on("joinError", (message) => {
  alert(message);
});
