import React, { useState } from "react";
import Confetti from "react-confetti";
import "./App.css";
import dice1 from './assets/dice1.png';
import dice2 from './assets/dice2.png';
import dice3 from './assets/dice3.png';
import dice4 from './assets/dice4.png';
import dice5 from './assets/dice5.png';
import dice6 from './assets/dice6.png';

const BOARD_SIZE = 6;
const PATH_LENGTH = (BOARD_SIZE - 1) * 4;

const initialPlayers = [
  { id: 1, position: 0, laps: 0, color: "red" },
  { id: 2, position: 0, laps: 0, color: "blue" },
  { id: 3, position: 0, laps: 0, color: "green" },
  { id: 4, position: 0, laps: 0, color: "orange" },
];

const diceImages = [dice1, dice2, dice3, dice4, dice5, dice6];

function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState(6);
  const [winner, setWinner] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [started, setStarted] = useState(false);

  // 🎲 Dice roll
  const rollDice = () => {
    if (!started || winner || isRolling) return;

    setIsRolling(true);

    let interval = setInterval(() => {
      const randomFace = Math.floor(Math.random() * 6) + 1;
      setDice(randomFace);
    }, 100);

    const finalRoll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      clearInterval(interval);
      setDice(finalRoll);

      setPlayers((prev) => {
        const updated = [...prev];
        const p = { ...updated[currentPlayer] };

        let oldPos = p.position;
        let newPos = (oldPos + finalRoll) % PATH_LENGTH;

        if (oldPos + finalRoll >= PATH_LENGTH) {
          p.laps += 1;
        }

        p.position = newPos;

        // Capture check
        for (let i = 0; i < updated.length; i++) {
          if (i !== currentPlayer && updated[i].position === newPos) {
            updated[i] = { ...updated[i], position: 0, laps: 0 };
          }
        }

        updated[currentPlayer] = p;

        if (p.position === 0 && p.laps >= 2) {
          setWinner(p.id);
        }

        return updated;
      });

      setCurrentPlayer((prev) => (prev + 1) % players.length);
      setIsRolling(false);
    }, 1000);
  };

  // 🟢 Start / Reset game
  const startGame = () => {
    setPlayers(initialPlayers);
    setCurrentPlayer(0);
    setDice(6);
    setWinner(null);
    setStarted(true);
  };

  const resetGame = () => {
    setPlayers(initialPlayers);
    setCurrentPlayer(0);
    setDice(6);
    setWinner(null);
    setStarted(false);
  };

  // 🏆 Leaderboard
  const getLeaderboard = () => {
    return [...players].sort((a, b) => {
      if (b.laps !== a.laps) return b.laps - a.laps;
      return b.position - a.position;
    });
  };

  // 🔲 Board cell indexing
  const getCellIndex = (row, col) => {
    if (row === 0) return col;
    if (col === BOARD_SIZE - 1) return (BOARD_SIZE - 1) + row;
    if (row === BOARD_SIZE - 1) return (BOARD_SIZE - 1) * 2 + (BOARD_SIZE - 1 - col);
    if (col === 0) return (BOARD_SIZE - 1) * 3 + (BOARD_SIZE - 1 - row);
    return null;
  };

  // 🎯 Render tokens
  const renderTokens = (index) => {
    const tokensHere = players.filter((p) => p.position === index);
    const count = tokensHere.length;

    return tokensHere.map((p, i) => {
      let style = {
        background: p.color,
        position: "absolute",
        borderRadius: "50%",
        transition: "all 0.3s ease",
        border: "2px solid white",
        boxShadow: "0 0 3px rgba(0,0,0,0.5)",
      };

      if (count === 1) {
        style.width = "70%";
        style.height = "70%";
        style.top = "50%";
        style.left = "50%";
        style.transform = "translate(-50%, -50%)";
      } else {
        const angle = (i / count) * (2 * Math.PI);
        const radius = 30;
        style.width = "40%";
        style.height = "40%";
        style.top = `calc(50% + ${radius * Math.sin(angle)}%)`;
        style.left = `calc(50% + ${radius * Math.cos(angle)}%)`;
        style.transform = "translate(-50%, -50%)";
      }

      return <div key={p.id} className="token" style={style}></div>;
    });
  };

  return (
    <div className="game">
      {winner && <Confetti />} {/* 🎉 Confetti */}

      <h1 id="game-title">🏁 Rush Royale</h1>

      {/* Winner announcement */}
      {winner && <div className="winner-banner">🎉 Player {winner} Wins! 🎉</div>}

      {/* Start / Reset controls */}
      <div className="controls">
        {!started ? (
          <button className="btn start-btn" onClick={startGame}>Start Game</button>
        ) : (
          <button className="btn reset-btn" onClick={resetGame}>Reset Game</button>
        )}
      </div>

      {started && (
        <div className="game-layout">
          <div className="board">
            {Array.from({ length: BOARD_SIZE }).map((_, row) =>
              Array.from({ length: BOARD_SIZE }).map((_, col) => {
                const index = getCellIndex(row, col);
                const isStart = index === 0;

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`cell ${index !== null ? "path" : "empty"} ${isStart ? "start" : ""}`}
                  >
                    {index !== null && renderTokens(index)}
                  </div>
                );
              })
            )}
          </div>

          <div className="status">
            <div className="scoreboard">
              <h2>🏆 Scoreboard</h2>
              <div className="score-list">
                {getLeaderboard().map((p) => (
                  <div className="score-card" key={p.id} style={{ color: p.color }}>
                    Player {p.id} — Laps: {p.laps}
                  </div>
                ))}
              </div>
            </div>

            <button className="dice-box" onClick={rollDice}>
              <img
                src={diceImages[dice - 1]}
                alt={`Dice ${dice}`}
                className={`dice-image ${isRolling ? "rolling" : ""}`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
