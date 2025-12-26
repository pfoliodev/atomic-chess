import { Board } from '../core/Board.js';
import { Timer } from '../core/Timer.js';
/**
 * Gère le rendu de l'échiquier et de l'interface de jeu
 */
export class Renderer {
  constructor(appElementId = 'app') {
    this.appElement = document.getElementById(appElementId);
    this.hideGameOver = false;
  }

  /**
   * Rend l'échiquier et l'interface de jeu
   */
  renderGame(game, gameCode = null) {
    const board = game.getDisplayBoard();
    const eliminated = Board.getEliminatedPieces(board);
    const moves = game.moveHistory;
    const isGameOver = !!game.gameOver;
    const isReview = game.reviewIndex !== -1;

    const validMoves = game.getValidMovesForSelected();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const displayFiles = (game.playerColor === 'black') ? [...files].reverse() : files;
    const displayRanks = (game.playerColor === 'black') ? [...ranks].reverse() : ranks;

    const boardCells = [];
    const displayBoard = (game.playerColor === 'black')
      ? board.slice().reverse().map(r => r.slice().reverse())
      : board;

    displayBoard.forEach((row, rIdx) => {
      const actualR = (game.playerColor === 'black') ? 7 - rIdx : rIdx;
      boardCells.push(`<div class="coord flex items-center justify-center">${displayRanks[rIdx]}</div>`);

      row.forEach((piece, cIdx) => {
        const actualC = (game.playerColor === 'black') ? 7 - cIdx : cIdx;
        const isLight = (actualR + actualC) % 2 === 0;
        const isSel = game.selectedSquare && game.selectedSquare[0] === actualR && game.selectedSquare[1] === actualC;
        const isExplo = game.explosions.some(e => e[0] === actualR && e[1] === actualC);
        const isPossibleMove = validMoves.some(m => m[0] === actualR && m[1] === actualC);
        const hasPiece = piece !== null;

        const isDeadZone = game.variant.isSquareCollapsed && game.variant.isSquareCollapsed(actualR, actualC);

        // High-contrast professional palette - Slightly deeper for better piece detachment
        const lightColor = 'bg-[#cbd5e1]'; // Slate-300
        const darkColor = 'bg-[#64748b]';  // Slate-500
        const selColor = 'bg-blue-500/50';

        boardCells.push(`<div onclick="window.handleSquareClick(${actualR}, ${actualC})" 
               class="relative aspect-square flex items-center justify-center text-3xl sm:text-5xl cursor-pointer transition-colors
               ${isDeadZone ? 'bg-slate-900 border border-slate-800 opacity-40' : (isLight ? lightColor : darkColor)} 
               ${isSel ? selColor : ''} 
               ${isExplo ? 'bg-red-500 animate-pulse z-20' : ''}">
               
               ${!isDeadZone && isPossibleMove ? (hasPiece ? `<div class="capture-ring absolute z-30"></div>` : `<div class="move-dot z-30"></div>`) : ''}
               
               <span class="chess-piece relative z-10" 
                     style="color: ${Board.isWhitePiece(piece) ? '#FFFFFF' : '#020617'}; 
                     text-shadow: ${Board.isWhitePiece(piece)
            ? '0 0 2px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)'
            : '0 1px 1px rgba(255,255,255,0.2)'};">
                  ${piece ? Board.pieceSymbols[piece] : ''}
               </span>
          </div>`);
      });
    });

    boardCells.push(`<div></div>`);
    displayFiles.forEach(f => boardCells.push(`<div class="coord flex items-center justify-center uppercase">${f}</div>`));

    // Historique des coups - refined
    let historyHTML = "";
    for (let i = 0; i < game.moveHistory.length; i += 2) {
      historyHTML += `<div class="grid grid-cols-12 gap-2 border-b border-white/5 py-2 text-[11px] sm:text-xs font-medium">
          <span class="col-span-2 text-slate-500 font-mono">${Math.floor(i / 2) + 1}.</span>
          <span class="col-span-5 text-white">${game.moveHistory[i].notation}</span>
          <span class="col-span-5 text-slate-300">${game.moveHistory[i + 1] ? game.moveHistory[i + 1].notation : ""}</span>
        </div>`;
    }

    const whiteTime = game.timer.whiteTime;
    const blackTime = game.timer.blackTime;
    const whiteTimerClass = (whiteTime < 30 && game.currentPlayer === 'white') ? 'timer-warning' : '';
    const blackTimerClass = (blackTime < 30 && game.currentPlayer === 'black') ? 'timer-warning' : '';
    const isGameWaiting = game.mode === 'online' && (!game.opponentConnected || game.moveHistory.length === 0);

    this.appElement.innerHTML = `
      <div class="h-screen bg-slate-950 text-white flex flex-col font-sans overflow-hidden">
        
        <!-- Header Info (Mobile Friendly) -->
        <div class="p-4 flex justify-between items-center glass-panel border-b border-white/5 shrink-0">
          <div class="flex items-center gap-4">
             <button onclick="location.reload()" class="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </button>
             <h2 class="text-sm font-black uppercase tracking-widest text-slate-400">
               ${game.gameOver ? 'PARTIE TERMINÉE' : (game.variant.constructor.name.replace('Variant', ''))}
             </h2>
          </div>
          ${gameCode ? `<div class="bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black text-blue-400">CODE: ${gameCode}</div>` : ''}
        </div>

        <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          <!-- Game Board Area -->
          <div class="flex-1 flex flex-col items-center justify-center p-1 sm:p-6 overflow-hidden">
            
            <!-- Opponent info -->
            <div class="w-full max-w-[min(90vw,512px)] flex justify-between items-end mb-2 sm:mb-4 px-2">
               <div class="flex-1 flex flex-col min-h-[48px] justify-end overflow-hidden">
                 <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${game.playerColor === 'white' ? 'Adversaire' : 'Vous'}</span>
                 <div class="flex items-center gap-2">
                   <span class="text-xs font-black uppercase ${game.currentPlayer === 'black' ? 'text-blue-400' : 'text-white'}">NOIRS</span>
                   <div class="flex flex-wrap gap-1 opacity-80 overflow-hidden">
                     ${eliminated.white.map(p => `<span class="text-[16px] sm:text-[18px] leading-none" style="color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.5)">${Board.pieceSymbols[p]}</span>`).join('')}
                   </div>
                 </div>
               </div>
               <div class="text-3xl font-mono font-bold tracking-tight ${blackTimerClass} shrink-0 ml-4">
                 ${isGameWaiting && game.currentPlayer === 'black' ? '...' : Timer.formatTime(blackTime)}
               </div>
            </div>

            <!-- Board Container -->
            <div id="chess-grid" class="w-full max-w-[min(90vw,512px)] grid grid-cols-[20px_repeat(8,1fr)] bg-slate-800 p-0.5 border border-white/10 shadow-2xl rounded-sm">
              ${boardCells.join('')}
            </div>

            <!-- Review Navigation Controls -->
            ${isGameOver ? `
            <div class="w-full max-w-[min(90vw,512px)] flex justify-center items-center gap-6 mt-6 py-3 glass-panel rounded-xl border border-white/5 shadow-lg">
              <button onclick="window.handleReviewMove(-2)" class="nav-btn p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
              <button onclick="window.handleReviewMove(-1)" class="nav-btn p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[60px] text-center">
                ${game.reviewIndex === -1 ? 'LIVE' : `COUP ${game.reviewIndex + 1}`}
              </span>
              <button onclick="window.handleReviewMove(1)" class="nav-btn p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onclick="window.handleReviewMove(2)" class="nav-btn p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            </div>` : ''}

            <!-- Player info -->
            <div class="w-full max-w-[min(90vw,512px)] flex justify-between items-start mt-4 px-2">
               <div class="text-3xl font-mono font-bold tracking-tight ${whiteTimerClass} shrink-0 mr-4">
                 ${isGameWaiting && game.currentPlayer === 'white' ? 'Wait' : Timer.formatTime(whiteTime)}
               </div>
               <div class="flex-1 flex flex-col items-end text-right min-h-[48px] justify-start overflow-hidden">
                 <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${game.playerColor === 'white' ? 'Vous' : 'Adversaire'}</span>
                 <div class="flex items-center gap-2 flex-row-reverse overflow-hidden">
                   <span class="text-xs font-black uppercase ${game.currentPlayer === 'white' ? 'text-blue-400' : 'text-white'}">BLANCS</span>
                   <div class="flex flex-wrap gap-1 opacity-80 flex-row-reverse overflow-hidden">
                     ${eliminated.black.map(p => `<span class="text-[16px] sm:text-[18px] leading-none" style="color: #020617; text-shadow: 0 1px 1px rgba(255,255,255,0.2)">${Board.pieceSymbols[p]}</span>`).join('')}
                   </div>
                 </div>
               </div>
            </div>

          </div>

          <!-- Sidepanel (History) -->
          <div class="w-full lg:w-80 bg-slate-900/50 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 overflow-hidden">
             ${game.mode === 'coach' ? `
             <div class="p-3 sm:p-4 border-b border-indigo-500/30 bg-indigo-600/5 ${game.coachFeedback && game.coachFeedback.includes('ALERTE') ? 'critical-alert' : ''}">
                <div class="flex items-center gap-2 mb-1 sm:mb-2">
                  <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 ${game.coachFeedback && game.coachFeedback.includes('ALERTE') ? 'bg-red-500' : 'bg-indigo-500'} rounded-full animate-pulse"></span>
                  <h3 class="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${game.coachFeedback && game.coachFeedback.includes('ALERTE') ? 'text-red-400' : 'text-indigo-400'}">ANALYSE DU COACH</h3>
                </div>
                <div id="coach-message" class="text-indigo-100 text-[10px] sm:text-xs font-medium leading-relaxed min-h-[2.5em] sm:min-h-[3em]">
                  ${game.coachFeedback || "En attente de votre premier coup..."}
                </div>
             </div>
             ` : ''}
             <div class="p-3 sm:p-4 border-b border-white/5 flex justify-between items-center">
                <h3 class="text-xs font-black uppercase tracking-widest text-slate-500 italic">LOG DE COMBAT</h3>
                <span class="text-[8px] sm:text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">${game.moveHistory.length} MOVES</span>
             </div>
             <div class="history-scroll overflow-y-auto flex-1 p-3 sm:p-4 lg:max-h-full max-h-[100px] sm:max-h-[150px]">
                ${game.moveHistory.length === 0 ? '<div class="h-full flex flex-col items-center justify-center opacity-20"><span class="text-3xl sm:text-5xl mb-2 sm:mb-4">♟️</span><p class="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">En attente du premier coup</p></div>' : historyHTML}
             </div>
          </div>

        </div>

        ${game.gameOver && !this.hideGameOver ? this.renderGameOverModal(game) : ''}
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

    let winTitle = '';
    let winMessage = '';

    if (game.gameOver === 'draw') {
      winTitle = 'ÉGALITÉ';
      winMessage = 'Pat ! Match nul !';
    } else {
      winTitle = game.gameOver === 'white' ? 'BLANCS GAGNENT' : 'NOIRS GAGNENT';
      if (game.variant && game.variant.isKingOnHill && game.variant.isKingOnHill(game.board, game.gameOver)) {
        winMessage = 'Le Roi a atteint la colline ! 🏔️';
      } else {
        winMessage = isTimeout ? 'Temps écoulé !' : 'Échec et mat ! ♔';
      }
    }

    return `
    <div class="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[min(90vw,384px)] px-4 sm:px-6 animate-in slide-in-from-bottom duration-500">
       <div class="glass-panel p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-3xl text-center bg-slate-900/80 backdrop-blur-3xl">
         <h1 class="text-lg sm:text-2xl font-black text-white mb-0.5 sm:mb-1 tracking-tighter uppercase">${winTitle}</h1>
         <p class="text-blue-400 text-[9px] sm:text-[10px] font-bold mb-4 sm:mb-6 uppercase tracking-widest">${winMessage}</p>
         
         <div class="grid grid-cols-2 gap-2">
           <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-500 text-white py-2.5 sm:py-3 rounded-xl font-bold text-[10px] sm:text-xs shadow-lg active:scale-95 transition-all uppercase">Rejouer</button>
           <button onclick="window.handleHideGameOver()" class="bg-slate-700 hover:bg-slate-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-[10px] sm:text-xs active:scale-95 transition-all uppercase">Analyser</button>
           <button onclick="location.reload()" class="col-span-2 bg-slate-800 text-slate-500 py-2 rounded-xl font-bold text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-slate-700 transition-colors mt-1">Menu Principal</button>
         </div>
       </div>
    </div>`;
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
