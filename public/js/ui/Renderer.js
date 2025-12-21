import { Board } from '../core/Board.js';
import { Timer } from '../core/Timer.js';

/**
 * Gère le rendu de l'échiquier et de l'interface de jeu
 */
export class Renderer {
  constructor(appElementId = 'app') {
    this.appElement = document.getElementById(appElementId);
  }

  /**
   * Rend l'échiquier et l'interface de jeu
   */
  renderGame(game, gameCode = null) {
    const validMoves = game.getValidMovesForSelected();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const displayFiles = (game.playerColor === 'black') ? [...files].reverse() : files;
    const displayRanks = (game.playerColor === 'black') ? [...ranks].reverse() : ranks;

    const boardCells = [];
    const displayBoard = (game.playerColor === 'black') 
      ? game.board.slice().reverse().map(r => r.slice().reverse()) 
      : game.board;
    
    displayBoard.forEach((row, rIdx) => {
      const actualR = (game.playerColor === 'black') ? 7 - rIdx : rIdx;
      boardCells.push(`<div class="coord coord-row">${displayRanks[rIdx]}</div>`);
      
      row.forEach((piece, cIdx) => {
        const actualC = (game.playerColor === 'black') ? 7 - cIdx : cIdx;
        const isLight = (actualR + actualC) % 2 === 0;
        const isSel = game.selectedSquare && game.selectedSquare[0] === actualR && game.selectedSquare[1] === actualC;
        const isExplo = game.explosions.some(e => e[0] === actualR && e[1] === actualC);
        const isPossibleMove = validMoves.some(m => m[0] === actualR && m[1] === actualC);
        const hasPiece = piece !== null;
        
        boardCells.push(`<div onclick="window.handleSquareClick(${actualR}, ${actualC})" 
               class="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-5xl cursor-pointer
               ${isLight ? 'bg-[#eeeed2]' : 'bg-[#769656]'} ${isSel ? 'bg-[#f6f669]' : ''} 
               ${isExplo ? 'bg-red-500 animate-pulse' : ''}">
               ${isPossibleMove ? (hasPiece ? `<div class="capture-ring absolute"></div>` : `<div class="move-dot"></div>`) : ''}
               <span class="chess-piece relative z-10" 
                     style="color: ${Board.isWhitePiece(piece) ? '#FFF' : '#000'}; 
                     text-shadow: ${Board.isWhitePiece(piece) ? '0 0 2px #000, 0 0 5px rgba(0,0,0,0.5)' : 'none'};">
                  ${piece ? Board.pieceSymbols[piece] : ''}
               </span>
          </div>`);
      });
    });

    boardCells.push(`<div></div>`);
    displayFiles.forEach(f => boardCells.push(`<div class="coord coord-col">${f}</div>`));

    // Historique des coups
    let historyHTML = "";
    for (let i = 0; i < game.moveHistory.length; i += 2) {
      historyHTML += `<div class="flex border-b border-slate-700 py-1.5 text-xs sm:text-sm">
          <span class="w-8 text-slate-500 font-mono">${Math.floor(i/2) + 1}.</span>
          <span class="flex-1 font-bold text-white">${game.moveHistory[i]}</span>
          <span class="flex-1 font-bold text-white">${game.moveHistory[i+1] || ""}</span>
        </div>`;
    }

    const whiteTime = game.timer.whiteTime;
    const blackTime = game.timer.blackTime;
    const whiteTimerClass = (whiteTime < 30 && game.currentPlayer === 'white') ? 'timer-warning' : '';
    const blackTimerClass = (blackTime < 30 && game.currentPlayer === 'black') ? 'timer-warning' : '';
    
    const isGameWaiting = game.mode === 'online' && (!game.opponentConnected || game.moveHistory.length === 0);

    this.appElement.innerHTML = `
      <div class="min-h-screen bg-slate-900 text-white p-2 sm:p-4 flex flex-col items-center">
        
        <div class="mb-4 w-full max-w-[350px] lg:w-72 bg-slate-800 rounded-xl p-3 shadow-xl">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm ${game.currentPlayer === 'black' ? 'text-yellow-400 font-bold' : 'text-slate-400'}">⚫ NOIRS</span>
            <span class="text-2xl font-mono font-bold ${blackTimerClass}">${isGameWaiting && game.currentPlayer === 'black' ? '...' : Timer.formatTime(blackTime)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm ${game.currentPlayer === 'white' ? 'text-yellow-400 font-bold' : 'text-slate-400'}">⚪ BLANCS</span>
            <span class="text-2xl font-mono font-bold ${whiteTimerClass}">${isGameWaiting && game.currentPlayer === 'white' ? 'En attente' : Timer.formatTime(whiteTime)}</span>
          </div>
        </div>
        
        <div class="mb-4 text-center">
          <h2 class="text-xl sm:text-2xl font-bold uppercase tracking-widest ${game.currentPlayer === 'white' ? 'text-white' : 'text-slate-400'}">
            ${game.gameOver ? 'Fin de partie' : (game.currentPlayer === 'white' ? 'Blancs' : 'Noirs')}
          </h2>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
<div id="chess-grid" class="grid grid-cols-[20px_repeat(8,1fr)] bg-slate-800 p-1 border-2 border-slate-700 shadow-2xl rounded-sm relative">
            ${boardCells.join('')}
            ${this.renderPortalEffects(game)}
          </div>

          <div class="w-full max-w-[350px] lg:w-72 bg-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[200px] lg:h-[512px]">
            <h3 class="font-bold border-b border-slate-600 pb-2 mb-2 flex justify-between items-center">
              <span>📜 HISTORIQUE</span>
              <span class="text-[10px] bg-slate-700 px-2 py-0.5 rounded">${game.moveHistory.length}</span>
            </h3>
            <div class="history-scroll overflow-y-auto flex-1 pr-1">${game.moveHistory.length === 0 ? '<p class="text-slate-500 text-center mt-10">Début de partie</p>' : historyHTML}</div>
          </div>
        </div>

        <div class="mt-6 flex gap-4">
          <button onclick="location.reload()" class="bg-slate-700 px-6 py-2 rounded-lg hover:bg-slate-600 transition text-sm">MENU</button>
          ${gameCode ? `<div class="bg-slate-800 px-4 py-2 rounded-lg border border-slate-600 text-sm">CODE: <span class="text-yellow-400 font-mono">${gameCode}</span></div>` : ''}
        </div>
        
        ${game.gameOver ? this.renderGameOverModal(game) : ''}
      </div>`;
      
    const historyDiv = document.querySelector('.history-scroll');
    if (historyDiv) historyDiv.scrollTop = historyDiv.scrollHeight;
  }

/**
   * Rend le modal de fin de partie
   */
  renderGameOverModal(game) {
    const whiteTime = game.timer.whiteTime;
    const blackTime = game.timer.blackTime;
    const isTimeout = whiteTime === 0 || blackTime === 0;
    
    // Détermine le message selon la variante et la raison de la victoire
    let winMessage = '';
    if (game.gameOver === 'draw') {
      winMessage = 'Pat ! Match nul !';
    } else {
      // Vérifie si c'est une victoire King of the Hill
      if (game.variant && game.variant.isKingOnHill && game.variant.isKingOnHill(game.board, game.gameOver)) {
        winMessage = game.gameOver === 'white' 
          ? 'Le Roi blanc atteint la colline ! 🏔️' 
          : 'Le Roi noir atteint la colline ! 🏔️';
      } else {
        // Victoire par échec et mat
        winMessage = game.gameOver === 'white' 
          ? 'Échec et mat ! Les Blancs gagnent ! ♔' 
          : 'Échec et mat ! Les Noirs gagnent ! ♔';
      }
    }
    
    return `<div class="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-6 text-center">
       <h1 class="text-5xl font-black text-white mb-2">${game.gameOver === 'draw' ? 'ÉGALITÉ' : (game.gameOver === 'white' ? 'BLANCS GAGNENT' : 'NOIRS GAGNENT')}</h1>
       <p class="text-yellow-500 text-2xl font-bold mb-8 italic">${isTimeout ? 'Temps écoulé !' : winMessage}</p>
       <button onclick="location.reload()" class="bg-blue-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:scale-110 transition shadow-lg">REJOUER</button>
    </div>`;
  }

/**
   * Rend les effets de portail pour la variante Portal
   */
  renderPortalEffects(game) {
    if (!game.variant || game.variant.constructor.name !== 'PortalVariant') {
      return '';
    }

    let portalHTML = '';
    
    // Effets de portail sur les bords
    portalHTML += `
      <!-- Portail gauche -->
      <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-purple-600 to-transparent opacity-60 animate-pulse"></div>
      <!-- Portail droit -->
      <div class="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-blue-600 to-transparent opacity-60 animate-pulse"></div>
      <!-- Portail haut -->
      <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-cyan-600 to-transparent opacity-60 animate-pulse"></div>
      <!-- Portail bas -->
      <div class="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-pink-600 to-transparent opacity-60 animate-pulse"></div>
      
      <!-- Symboles de portail -->
      <div class="absolute -left-6 top-1/2 transform -translate-y-1/2 text-2xl animate-spin">🌀</div>
      <div class="absolute -right-6 top-1/2 transform -translate-y-1/2 text-2xl animate-spin">🌀</div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-8 text-2xl animate-spin">🌀</div>
      <div class="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 text-2xl animate-spin">🌀</div>
    `;
    
    // Animation de portail récent si un mouvement vient de traverser un portail
    if (game.portalAnimation) {
      const anim = game.portalAnimation;
      portalHTML += this.renderPortalAnimation(anim);
    }
    
    return portalHTML;
  }

  /**
   * Rend une animation de portail spécifique
   */
  renderPortalAnimation(animation) {
    const { type, from, to, piece } = animation;
    const pieceSymbol = Board.pieceSymbols[piece] || '';
    
    let animHTML = '';
    
    switch(type) {
      case 'left':
        animHTML = `
          <div class="absolute left-0 top-1/2 transform -translate-y-1/2 text-4xl animate-ping">⬅️</div>
          <div class="absolute right-0 top-1/2 transform -translate-y-1/2 text-4xl animate-ping">➡️</div>
        `;
        break;
      case 'right':
        animHTML = `
          <div class="absolute right-0 top-1/2 transform -translate-y-1/2 text-4xl animate-ping">➡️</div>
          <div class="absolute left-0 top-1/2 transform -translate-y-1/2 text-4xl animate-ping">⬅️</div>
        `;
        break;
      case 'top':
        animHTML = `
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 text-4xl animate-ping">⬆️</div>
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-4xl animate-ping">⬇️</div>
        `;
        break;
      case 'bottom':
        animHTML = `
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-4xl animate-ping">⬇️</div>
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 text-4xl animate-ping">⬆️</div>
        `;
        break;
    }
    
    return animHTML;
  }

  /**
   * Ajoute l'animation de shake pour mouvement invalide
   */
  shakeBoard() {
    const grid = document.getElementById('chess-grid');
    if (grid) {
      grid.classList.add('shake-error');
      setTimeout(() => grid.classList.remove('shake-error'), 400);
    }
  }
}
