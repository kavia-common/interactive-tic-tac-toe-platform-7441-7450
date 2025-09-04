import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App is the main Tic Tac Toe application component.
 * It renders a centered vertical layout with a title, board, status, and controls.
 * Features:
 * - Interactive 3x3 board
 * - Player vs Player and Player vs Computer (basic AI)
 * - Restart/reset game
 * - Victory and draw detection
 * - Responsive, minimalistic light theme using provided palette
 */
function App() {
  // Theme is fixed to light to match requirement, but kept in state for future scalability
  const [theme] = useState('light');

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null)); // 0..8 cells
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'pvc'
  const [isGameOver, setIsGameOver] = useState(false);

  const winner = useMemo(() => calculateWinner(board), [board]);
  const isDraw = useMemo(() => !winner && board.every(Boolean), [board, winner]);

  // Update gameOver flag
  React.useEffect(() => {
    setIsGameOver(Boolean(winner) || isDraw);
  }, [winner, isDraw]);

  // Handle a move by user
  const handleCellClick = (index) => {
    if (isGameOver || board[index]) return;
    const nextBoard = board.slice();
    nextBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  // AI move for Player vs Computer
  React.useEffect(() => {
    if (mode !== 'pvc') return;
    if (isGameOver) return;
    // If it's O's turn (computer), make a move
    if (!xIsNext) {
      const move = chooseBestMove(board, 'O', 'X');
      if (move !== -1) {
        const nextBoard = board.slice();
        nextBoard[move] = 'O';
        setBoard(nextBoard);
        setXIsNext(true);
      }
    }
  }, [board, xIsNext, mode, isGameOver]);

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setIsGameOver(false);
  };

  // PUBLIC_INTERFACE
  const switchMode = (newMode) => {
    setMode(newMode);
    // Reset game when switching mode for clarity
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setIsGameOver(false);
  };

  // Status text
  const statusText = winner
    ? `Winner: ${winner}`
    : isDraw
      ? 'Draw!'
      : `Turn: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="ttt-app" data-theme={theme}>
      <main className="ttt-container">
        <h1 className="ttt-title">Tic Tac Toe</h1>

        <Board
          board={board}
          onCellClick={handleCellClick}
          gameOver={isGameOver}
          winner={winner}
        />

        <div className="ttt-status" role="status" aria-live="polite">
          {statusText}
        </div>

        <div className="ttt-controls">
          <button
            className="btn primary"
            onClick={restartGame}
            aria-label="Restart the game"
          >
            Restart
          </button>

          <div className="mode-switch">
            <button
              className={`btn ${mode === 'pvp' ? 'accent' : 'ghost'}`}
              onClick={() => switchMode('pvp')}
              aria-pressed={mode === 'pvp'}
              aria-label="Switch to Player vs Player mode"
            >
              Player vs Player
            </button>
            <button
              className={`btn ${mode === 'pvc' ? 'accent' : 'ghost'}`}
              onClick={() => switchMode('pvc')}
              aria-pressed={mode === 'pvc'}
              aria-label="Switch to Player vs Computer mode"
            >
              Player vs Computer
            </button>
          </div>
        </div>

        <footer className="ttt-footer">
          <small>Modern, minimalistic UI</small>
        </footer>
      </main>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Board renders a 3x3 grid and highlights the winning line if present.
 */
function Board({ board, onCellClick, gameOver, winner }) {
  const winningLine = getWinningLine(board);

  return (
    <div
      className="board"
      role="grid"
      aria-label="Tic Tac Toe board"
      aria-disabled={gameOver}
    >
      {board.map((value, idx) => {
        const isWinningCell = winningLine?.includes(idx);
        return (
          <button
            key={idx}
            className={`cell ${isWinningCell ? 'win' : ''}`}
            role="gridcell"
            aria-label={`Cell ${idx + 1}${value ? `, ${value}` : ''}`}
            onClick={() => onCellClick(idx)}
            disabled={gameOver || Boolean(value)}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * calculateWinner determines if there is a winner on the board.
 */
function calculateWinner(squares) {
  const lines = WIN_LINES;
  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * getWinningLine returns the indices of the winning line (if any) for highlighting.
 */
function getWinningLine(squares) {
  const lines = WIN_LINES;
  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * chooseBestMove implements a simple AI:
 * 1. Win if possible
 * 2. Block opponent's win
 * 3. Take center
 * 4. Take a corner
 * 5. Take any side
 */
function chooseBestMove(squares, ai, human) {
  // 1. Try to win
  for (let i = 0; i < 9; i += 1) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = ai;
      if (calculateWinner(copy) === ai) return i;
    }
  }
  // 2. Block human
  for (let i = 0; i < 9; i += 1) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = human;
      if (calculateWinner(copy) === human) return i;
    }
  }
  // 3. Center
  if (!squares[4]) return 4;

  // 4. Corners
  const corners = [0, 2, 6, 8].filter((i) => !squares[i]);
  if (corners.length) return corners[0];

  // 5. Sides
  const sides = [1, 3, 5, 7].filter((i) => !squares[i]);
  if (sides.length) return sides[0];

  return -1;
}

// Constants
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default App;
