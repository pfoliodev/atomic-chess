// src/ui.js
import { PIECES } from './core.js';

export class ChessUI {
    constructor(game, containerId) {
        this.game = game;
        this.container = document.getElementById(containerId);
        this.selectedSquare = null;
        this.explosions = [];
        this.playerColor = 'white'; 
        
        // NOUVEAU : On gère l'état de l'affichage
        this.view = 'menu'; // 'menu' ou 'game'
        this.selectedTime = 600; // 10 min par défaut
    }

    // --- GESTION DES VUES ---

    switchToGame() {
        this.view = 'game';
        this.render();
    }

    switchToMenu() {
        this.view = 'menu';
        this.render();
    }

    setPlayerColor(color) {
        this.playerColor = color;
    }

    // --- RENDU PRINCIPAL ---

    render() {
        if (this.view === 'menu') {
            this.container.innerHTML = this.generateMenuHTML();
        } else {
            this.renderGame();
        }
    }

    // --- LE MENU (Ton code original réintégré) ---
    
    generateMenuHTML() {
        // Helper pour la classe CSS du bouton temps actif
        const timeBtnClass = (time) => 
            `time-btn bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 text-sm ${this.selectedTime === time ? 'ring-2 ring-yellow-400' : ''}`;

        return `
        <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div class="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
            <h1 class="text-4xl font-bold text-white mb-8">☢️ ATOMIC CHESS</h1>
            
            <div class="mb-6">
              <p class="text-slate-400 text-sm mb-3">⏱️ Contrôle du temps</p>
              <div class="grid grid-cols-4 gap-2">
                <button onclick="window.setTimeControl(180)" class="${timeBtnClass(180)}">3min</button>
                <button onclick="window.setTimeControl(300)" class="${timeBtnClass(300)}">5min</button>
                <button onclick="window.setTimeControl(600)" class="${timeBtnClass(600)}">10min</button>
                <button onclick="window.setTimeControl(900)" class="${timeBtnClass(900)}">15min</button>
              </div>
            </div>

            <button onclick="window.startLocal()" class="w-full bg-purple-600 text-white py-4 rounded-xl font-bold mb-4 hover:bg-purple-700 transition transform hover:scale-105">LOCAL</button>
            <button onclick="window.createOnlineGame()" class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mb-4 hover:bg-blue-700 transition transform hover:scale-105">CRÉER EN LIGNE</button>
            
            <div class="flex gap-2">
                <input type="text" id="inputCode" placeholder="Code partie" class="w-2/3 p-4 rounded-xl font-bold text-slate-900 text-center">
                <button onclick="window.joinOnlineGame()" class="w-1/3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">REJOINDRE</button>
            </div>
          </div>
        </div>`;
    }

    // --- LE JEU (L'ancien render) ---

    renderGame() {
        const boardHTML = this.generateBoardHTML();
        const infoHTML = this.generateInfoHTML();
        
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

    // ... (Garde tes méthodes generateBoardHTML, generateInfoHTML, etc. ici, inchangées) ...
    // Je te remets juste les méthodes helper nécessaires si tu ne les as plus :

    generateBoardHTML() {
        let html = '';
        const ranks = ['8','7','6','5','4','3','2','1'];
        const files = ['a','b','c','d','e','f','g','h'];
        const displayRows = this.playerColor === 'black' ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
        const displayCols = this.playerColor === 'black' ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

        displayRows.forEach((r) => {
            html += `<div class="coord coord-row">${this.playerColor === 'black' ? ranks[7-r] : ranks[r]}</div>`;
            displayCols.forEach((c) => {
                const piece = this.game.board[r][c];
                const isLight = (r + c) % 2 === 0;
                const isSel = this.selectedSquare && this.selectedSquare[0] === r && this.selectedSquare[1] === c;
                const isExplo = this.explosions.some(e => e[0] === r && e[1] === c);

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
        html += '<div></div>'; 
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
            </div>`;
    }

    generateHistoryHTML() {
        return `<div class="hidden lg:block w-64 bg-slate-800 h-[512px] p-4 text-sm overflow-y-auto">
            <h3 class="font-bold border-b border-slate-600 mb-2">Historique</h3>
            ${this.game.history.map((m, i) => `<div class="py-1 border-b border-slate-700">${i+1}. ${m}</div>`).join('')}
        </div>`;
    }

    generateMenuButtons() {
        // Le bouton recharge la page pour revenir au menu proprement (plus simple pour reset le state)
        return `<div class="mt-4"><button onclick="location.reload()" class="bg-slate-700 px-4 py-2 rounded text-white hover:bg-slate-600">Menu Principal</button></div>`;
    }

    generateGameOverOverlay() {
        if (!this.game.gameOver) return '';
        return `
        <div class="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
             <h1 class="text-5xl font-black text-white mb-4">FIN DE PARTIE</h1>
             <p class="text-yellow-400 text-2xl mb-8">${this.game.gameOver.toUpperCase()} GAGNE</p>
             <button onclick="location.reload()" class="bg-blue-600 px-8 py-3 rounded-full text-white font-bold hover:scale-110 transition">REJOUER</button>
        </div>`;
    }

    isWhite(p) { return p && p === p.toUpperCase(); }
    formatTime(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }
    
    triggerExplosion(squares) {
        this.explosions = squares;
        this.renderGame(); // Force le rendu Game
        setTimeout(() => {
            this.explosions = [];
            this.renderGame();
        }, 600);
    }
}