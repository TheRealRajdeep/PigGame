"use strict";
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});
app.get("/join/:inviteCode", (req, res) => {
  res.sendFile(path.join(__dirname, "public/join.html"));
});

const gameSessions = new Map();

// let gameState = {
//   creator,
//   opponent,
//   gameStarted,
//   currentTurn,
//   scores: [0,0],
//   currentScore: 0,
// }

io.on("connection", (socket) => {
  console.log("New client Connected");

  socket.on("createGame", (playerName, inviteCode) => {
    console.log(`Game created by ${playerName} with invite code ${inviteCode}`);
    console.log("Game created socket", socket.id);
    gameSessions.set(inviteCode.toString(), {
      creator: { id: playerName, name: playerName },
      opponent: null,
      gameStarted: false,
      currentTurn: playerName,
      scores: [0, 0],
      currentScore: 0,
    });
    socket.join(inviteCode);
    socket.emit("gameCreated", inviteCode);
  });

  socket.on("joinGame", (inviteCode, playerName) => {
    console.log(`${playerName} joined game ${inviteCode}`);
    const game = gameSessions.get(inviteCode);
    if (game) {
      if (!game.opponent) {
        console.log("Opponent joined socket", socket.id);
        game.opponent = { id: playerName, name: playerName };
        game.gameStarted = true;
        socket.join(inviteCode);
        io.to(inviteCode).emit("gameStart", {
          inviteCode,
          creator: game.creator.name,
          opponent: playerName,
          currentTurn: game.currentTurn,
          scores: game.scores,
        });
      } else {
        socket.emit("gameFull", "Game room is full");
      }
    } else {
      socket.emit("gameNotFound", "Invalid invite code");
    }
  });

  socket.on("playerMove", (data) => {
    console.log("Move received:", data);

    const { inviteCode, player, type } = data;

    // Get Game session
    const game = gameSessions.get(inviteCode);
    console.log("Game session", game);

    if (game) {
      switch (type) {
        case "roll":
          if (game && game.currentTurn === player) {
            // Player can roll the dice
            const dice = Math.trunc(Math.random() * 6) + 1;

            if (dice === 1) {
              game.currentScore = 0;

              game.activePlayer = game.currentTurn === game.creator.id ? 1 : 0;
              game.currentTurn =
                game.currentTurn === game.creator.id
                  ? game.opponent.id
                  : game.creator.id;

              let gameState = {
                dice,
                currentScore: game.currentScore,
                activePlayer: game.activePlayer,
                // Turn remains the same
                currentTurn: game.currentTurn,
                type: "roll",
              };

              gameSessions.set(inviteCode, game);

              io.to(inviteCode).emit("gameStateChanged", { ...gameState });
            } else {
              game.currentScore = (game.currentScore || 0) + dice;

              let gameState = {
                dice,
                currentScore: game.currentScore,
                activePlayer: game.currentTurn === game.creator.id ? 0 : 1,
                // Turn remains the same
                currentTurn: game.currentTurn,
                type: "roll",
              };

              console.log("Roll game stored to session", game);

              gameSessions.set(inviteCode, {
                ...game,
                activePlayer: game.currentTurn === game.creator.id ? 0 : 1,
              });

              io.to(inviteCode).emit("gameStateChanged", { ...gameState });
            }
          } else {
            // Player can't roll the dice
            io.to(inviteCode).emit("notYourTurn", "It's not your turn");
          }
          break;
        case "hold":
          if (game && game.currentTurn === player) {
            if (
              Number(game.scores[game.activePlayer] + game.currentScore) >= 100
            ) {
              // Because the game is over we can reset the game state.
              game.scores[game.activePlayer] += game.currentScore;
              game.currentScore = 0;

              io.to(inviteCode).emit("gameOver", {
                winnerIndex: game.scores[0] >= 100 ? 0 : 1,
                winner: player,
                scores: game.scores,
                currentScore: game.currentScore,
              });
            } else {
              // Add the current score to the current player's total
              game.scores[game.activePlayer] += game.currentScore;

              // Reset currentScore because the turn has changed
              game.currentScore = 0;

              // For UI
              game.activePlayer = game.currentTurn === game.creator.id ? 1 : 0;

              // For game logic
              game.currentTurn =
                game.currentTurn === game.creator.id
                  ? game.opponent.id
                  : game.creator.id;

              console.log("Hold game on Server", game);
              gameSessions.set(inviteCode, game);
              io.to(inviteCode).emit("gameStateChanged", {
                ...game,
                type: "hold",
              });
            }
          } else {
            io.to(inviteCode).emit("notYourTurn", "It's not your turn");
          }

          break;
        case "newGame":
          game.scores = [0, 0];
          game.currentScore = 0;
          game.currentTurn = game.creator.id;
          game.activePlayer = 0;

          io.to(inviteCode).emit("gameStateChanged", {
            ...game,
            type: "newGame",
          });

          break;
      }
    } else {
      socket.emit("gameNotFound", "Invalid invite code");
    }
  });

  socket.on("rejoin", ({ inviteCode }) => {
    console.log(inviteCode);
    socket.join(inviteCode);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
