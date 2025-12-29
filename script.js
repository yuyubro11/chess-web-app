// Single-player chess vs simple AI (minimax material eval)
const game = new Chess();
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
let selected = null;

const unicodePieces = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚'
};

function pieceToChar(piece){
  if(!piece) return '';
  const ch = unicodePieces[piece.type];
  return piece.color === 'w' ? ch.toUpperCase() : ch;
}

function render(){
  boardEl.innerHTML = '';
  const board = game.board(); // 8x8 array, rank 8..1
  const files = ['a','b','c','d','e','f','g','h'];
  for(let r=0;r<8;r++){
    for(let f=0;f<8;f++){
      const square = files[f] + (8 - r);
      const sqEl = document.createElement('div');
      sqEl.className = 'square ' + (((r+f)%2===0)?'light':'dark');
      sqEl.dataset.square = square;
      const piece = board[r][f];
      sqEl.textContent = piece ? pieceToChar(piece) : '';
      sqEl.addEventListener('click', onSquareClick);
      if(selected === square) sqEl.classList.add('selected');
      boardEl.appendChild(sqEl);
    }
  }
  updateStatus();
}

function updateStatus(){
  if(game.in_checkmate()){
    statusEl.textContent = 'Checkmate - ' + (game.turn()==='w' ? 'Black' : 'White') + ' wins';
  } else if(game.in_draw()){
    statusEl.textContent = 'Draw';
  } else {
    statusEl.textContent = `Turn: ${game.turn() === 'w' ? 'White (you)' : 'Black (AI)'}${game.in_check() ? ' — check' : ''}`;
  }
}

function onSquareClick(e){
  const sq = e.currentTarget.dataset.square;
  // Only allow player moves when it's White's turn
  if(game.turn() !== 'w') return;

  const piece = game.get(sq);
  if(selected){
    // attempt move
    const move = game.move({from: selected, to: sq, promotion: 'q'});
    selected = null;
    if(move){
      render();
      // after player's move, let AI play
      setTimeout(() => { aiMove(); }, 200);
    } else {
      // if click another of player's pieces, select it
      if(piece && piece.color === 'w') selected = sq;
      render();
    }
  } else {
    if(piece && piece.color === 'w'){
      selected = sq;
      render();
    }
  }
}

document.getElementById('newGame').addEventListener('click', ()=>{
  game.reset(); selected = null; render();
});

document.getElementById('undo').addEventListener('click', ()=>{
  // undo last two half-moves (player + AI)
  game.undo(); game.undo(); selected = null; render();
});

// Simple material evaluation
const pieceValue = {p:1,n:3,b:3,r:5,q:9,k:0};
function evaluateBoard(g){
  let sum = 0;
  const b = g.board();
  for(let r=0;r<8;r++){
    for(let f=0;f<8;f++){
      const p = b[r][f];
      if(p){
        const v = pieceValue[p.type] || 0;
        sum += (p.color === 'w' ? v : -v);
      }
    }
  }
  return sum;
}

function minimax(g, depth, alpha, beta, isMax){
  if(depth === 0) return evaluateBoard(g);
  const moves = g.moves({verbose:true});
  if(moves.length === 0) return evaluateBoard(g);

  if(isMax){
    let maxEval = -Infinity;
    for(const m of moves){
      g.move(m);
      const evalScore = minimax(g, depth-1, alpha, beta, false);
      g.undo();
      if(evalScore > maxEval) maxEval = evalScore;
      if(evalScore > alpha) alpha = evalScore;
      if(beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for(const m of moves){
      g.move(m);
      const evalScore = minimax(g, depth-1, alpha, beta, true);
      g.undo();
      if(evalScore < minEval) minEval = evalScore;
      if(evalScore < beta) beta = evalScore;
      if(beta <= alpha) break;
    }
    return minEval;
  }
}

function aiMove(){
  if(game.game_over()) return;
  const moves = game.moves({verbose:true});
  let bestScore = Infinity;
  let bestMoves = [];
  const depth = 3; // lookahead depth
  for(const m of moves){
    game.move(m);
    const score = minimax(game, depth-1, -Infinity, Infinity, true);
    game.undo();
    if(score < bestScore){
      bestScore = score; bestMoves = [m];
    } else if(score === bestScore){
      bestMoves.push(m);
    }
  }
  const choice = bestMoves[Math.floor(Math.random()*bestMoves.length)];
  if(choice) game.move(choice);
  render();
}

// initial render
render();
