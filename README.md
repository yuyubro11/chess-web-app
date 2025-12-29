# Chess Web App

A simple starter web app for a chess game. This repository contains a minimal HTML/CSS/JS skeleton you can open locally or deploy to GitHub Pages.

## What's included
- `index.html` — basic page and board placeholder
- `styles.css` — minimal styles
- `script.js` — initial JavaScript scaffold
## Quick start
1. Open `index.html` in a browser to view the starter UI.
2. Edit `script.js` to add game logic or integrate a chess engine like `chess.js`.
## Next steps
- Add a chessboard rendering library (e.g. `chessboard.js`) or implement your own.
- Add game state, move validation, and multiplayer support.
## License
This is a starter template — add a license if you plan to publish.
## Play vs AI
This project now includes a simple single-player mode where you (White) play against a built-in AI (Black). The AI uses a shallow minimax search over material evaluation — it's intentionally simple but gives a basic opponent.
Controls:
- Click a piece you own (White), then click the target square to move.
- `New Game` resets the board.
- `Undo` attempts to undo the last full move (your move + AI move).
Open `index.html` in a browser to try it locally.
