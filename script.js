// Ensure chess.js is loaded; if not, load it dynamically then initialize
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
let selected = null;

function loadChessThenStart(){
  if(typeof Chess === 'function'){
    startGame();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/1.0.0/chess.min.js';
  script.onload = () => startGame();
  script.onerror = () => {
    statusEl.textContent = 'Failed to load chess.js library. Check network or vendor the file locally.';
    console.error('Failed to load chess.js from CDN');
  };
  document.head.appendChild(script);
}

function startGame(){
  let game;
  try{ game = new Chess(); }catch(e){
    statusEl.textContent = 'Failed to initialize chess engine.';
    console.error(e);
    return;
  }

  const unicodePieces = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
  function pieceToChar(piece){ if(!piece) return ''; const ch = unicodePieces[piece.type]; return piece.color === 'w' ? ch.toUpperCase() : ch; }

  function render(){
    boardEl.innerHTML = '';
    const board = game.board();
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
    if(game.turn() !== 'w') return;
    const piece = game.get(sq);
    if(selected){
      const move = game.move({from: selected, to: sq, promotion: 'q'});
      selected = null;
      if(move){ render(); setTimeout(()=>aiMove(),200); } else { if(piece && piece.color === 'w') selected = sq; render(); }
    } else { if(piece && piece.color === 'w'){ selected = sq; render(); } }
  }

  document.getElementById('newGame').addEventListener('click', ()=>{ game.reset(); selected = null; render(); });
  document.getElementById('undo').addEventListener('click', ()=>{ game.undo(); game.undo(); selected = null; render(); });

  const pieceValue = {p:1,n:3,b:3,r:5,q:9,k:0};
  function evaluateBoard(g){ let sum=0; const b=g.board(); for(let r=0;r<8;r++){ for(let f=0;f<8;f++){ const p=b[r][f]; if(p){ const v=pieceValue[p.type]||0; sum += (p.color==='w'?v:-v); } } } return sum; }

  function minimax(g, depth, alpha, beta, isMax){
    if(depth===0) return evaluateBoard(g);
    const moves = g.moves({verbose:true});
    if(moves.length===0) return evaluateBoard(g);
    if(isMax){ let maxEval=-Infinity; for(const m of moves){ g.move(m); const evalScore=minimax(g,depth-1,alpha,beta,false); g.undo(); if(evalScore>maxEval) maxEval=evalScore; if(evalScore>alpha) alpha=evalScore; if(beta<=alpha) break; } return maxEval; }
    else { let minEval=Infinity; for(const m of moves){ g.move(m); const evalScore=minimax(g,depth-1,alpha,beta,true); g.undo(); if(evalScore<minEval) minEval=evalScore; if(evalScore<beta) beta=evalScore; if(beta<=alpha) break; } return minEval; }
  }

  function aiMove(){ if(game.game_over()) return; const moves=game.moves({verbose:true}); let bestScore=Infinity; let bestMoves=[]; const depth=3; for(const m of moves){ game.move(m); const score=minimax(game,depth-1,-Infinity,Infinity,true); game.undo(); if(score<bestScore){ bestScore=score; bestMoves=[m]; } else if(score===bestScore){ bestMoves.push(m); } } const choice = bestMoves[Math.floor(Math.random()*bestMoves.length)]; if(choice) game.move(choice); render(); }

  render();
}

// start
loadChessThenStart();
