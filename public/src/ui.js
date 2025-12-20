// src/ui.js
import { PIECES } from './core.js';

export class ChessUI {
    constructor(game, containerId) {
        this.game = game;
        this.container = document.getElementById(containerId);
        this.selectedSquare = null;
        this.explosions = [];
        this.playerColor = 'white'; // Vue par défaut (sera écrasé en online)
    }

    setPlayerColor(color) {
        this.playerColor = color;
        this.render();
    }

    // Convertit (row, col) en coordonnées d'écran selon la rotation du plateau
    getVisualCoords(r, c) {
        if (this.playerColor === 'black') {
            return { r: 7 - r, c: 7 - c };
        }
        return { r, c };
    }

    // L'inverse : du clic écran vers les coordonnées logiques
    getLogicalCoords(visualR, visualC) {
        if (this.playerColor === 'black') {
            return { r: 7 - visualR, c: 7 - visualC };
        }
        return { r: visualR, c: visualC };
    }

    render() {
        const boardHTML = this.generateBoardHTML();
        const infoHTML = this.generateInfoHTML();
        
        // Structure globale (reprise de ton index.html mais simplifiée)
        this.container.innerHTML = `
            <div class="min-h-screen bg-slate-900 text-white p-2 sm:p-4 flex flex-col items-center">
                ${infoHTML}
                <div class="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                    <div id="chess-grid" class="grid grid-cols-[20px_repeat(8,1fr)] bg-slate-800 p-1 border-2 border-slate-700 shadow-2xl rounded-sm">
                        ${boardHTML}
                    </div>
                    ${this.generateHistoryHTML()}
                </div>
                ${this.generateMenuButtons()}
                ${this.generateGameOverOverlay()}
            </div>
        `;
    }

    generateBoardHTML() {
        let html = '';
        const ranks = ['8','7','6','5','4','3','2','1'];
        const files = ['a','b','c','d','e','f','g','h'];
        
        // Gestion de l'inversion du board
        const displayRows = this.playerColor === 'black' ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
        const displayCols = this.playerColor === 'black' ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

        displayRows.forEach((r, rIdx) => {
            html += `<div class="coord coord-row">${this.playerColor === 'black' ? ranks[7-r] : ranks[r]}</div>`;
            
            displayCols.forEach((c, cIdx) => {
                const piece = this.game.board[r][c];
                const isLight = (r + c) % 2 === 0;
                const isSel = this.selectedSquare && this.selectedSquare[0] === r && this.selectedSquare[1] === c;
                const isExplo = this.explosions.some(e => e[0] === r && e[1] === c);
                
                // Calcul des coups possibles pour les points (optionnel, demande d'appeler game.rules.getValidMoves)
                const isPossible = false; // À implémenter si tu veux les dots

                html += `
                <div onclick="window.onSquareClick(${r}, ${c})" 
                     class="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-5xl cursor-pointer
                     ${isLight ? 'bg-[#eeeed2]' : 'bg-[#769656]'} 
                     ${isSel ? 'bg-[#f6f669]' : ''} 
                     ${isExplo ? 'bg-red-500 animate-pulse' : ''}">
                     <span class="chess-piece relative z-10" style="color: ${this.isWhite(piece) ? '#FFF' : '#000'}; text-shadow: ${this.isWhite(piece) ? '0 0 2px #000' : 'none'}">
                        ${piece ? PIECES[piece] : ''}
                     </span>
                </div>`;
            });
        });
        
        // Ajout des lettres en bas
        html += '<div></div>'; // Coin vide
        displayCols.forEach(c => html += `<div class="coord coord-col">${files[c]}</div>`);
        
        return html;
    }

    generateInfoHTML() {
        return `
            <div class="mb-4 w-full max-w-[350px] bg-slate-800 rounded-xl p-3 shadow-xl flex justify-between">
                <div class="text-center">
                    <div class="text-xs text-slate-400">NOIRS</div>
                    <div class="text-2xl font-mono ${this.game.turn === 'black' ? 'text-yellow-400' : 'text-white'}">${this.formatTime(this.game.timers.black)}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs text-slate-400">BLANCS</div>
                    <div class="text-2xl font-mono ${this.game.turn === 'white' ? 'text-yellow-400' : 'text-white'}">${this.formatTime(this.game.timers.white)}</div>
                </div>
            </div>
        `;
    }

    generateHistoryHTML() {
        return `<div class="hidden lg:block w-64 bg-slate-800 h-[512px] p-4 text-sm overflow-y-auto">
            <h3 class="font-bold border-b border-slate-600 mb-2">Historique</h3>
            ${this.game.history.map((m, i) => `<div class="py-1 border-b border-slate-700">${i+1}. ${m}</div>`).join('')}
        </div>`;
    }

    generateMenuButtons() {
        return `<div class="mt-4"><button onclick="location.reload()" class="bg-slate-700 px-4 py-2 rounded text-white">Menu Principal</button></div>`;
    }

    generateGameOverOverlay() {
        if (!this.game.gameOver) return '';
        return `
        <div class="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
             <h1 class="text-5xl font-black text-white mb-4">FIN DE PARTIE</h1>
             <p class="text-yellow-400 text-2xl mb-8">${this.game.gameOver.toUpperCase()} GAGNE</p>
             <button onclick="location.reload()" class="bg-blue-600 px-8 py-3 rounded-full text-white font-bold">REJOUER</button>
        </div>`;
    }

    // Utils
    isWhite(p) { return p && p === p.toUpperCase(); }
    formatTime(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }

    triggerExplosion(squares) {
        this.explosions = squares;
        this.render();
        setTimeout(() => {
            this.explosions = [];
            this.render();
        }, 600);
    }
}