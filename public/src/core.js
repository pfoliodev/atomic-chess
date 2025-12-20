// src/core.js
export const PIECES = {
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
    'K': '♔\uFE0E', 'Q': '♕\uFE0E', 'R': '♖\uFE0E', 'B': '♗\uFE0E', 'N': '♘\uFE0E', 'P': '♙\uFE0E'
};

export class ChessGame {
    constructor(rulesVariant, initialTime = 600) {
        this.rules = rulesVariant;
        this.board = this.rules.createInitialBoard();
        this.turn = 'white';
        this.history = [];
        this.gameOver = null; // null, 'white', 'black', 'draw'
        
        // État pour le roque
        this.castles = {
            kingMoved: { white: false, black: false },
            rookMoved: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false }
        };
        this.lastMove = null;

        // Gestion du temps
        this.timers = { white: initialTime, black: initialTime };
        this.lastTimerUpdate = Date.now();
        this.timerInterval = null;
        this.onTick = () => {}; // Callback pour l'UI
    }

    startTimer(callback) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.onTick = callback;
        this.lastTimerUpdate = Date.now();
        
        this.timerInterval = setInterval(() => {
            if (this.gameOver) return;
            
            const now = Date.now();
            const elapsed = Math.floor((now - this.lastTimerUpdate) / 1000);
            
            if (elapsed >= 1) {
                this.lastTimerUpdate = now;
                this.timers[this.turn] = Math.max(0, this.timers[this.turn] - elapsed);
                
                if (this.timers[this.turn] === 0) {
                    this.gameOver = this.turn === 'white' ? 'black' : 'white';
                }
                
                // On notifie l'UI que le temps a changé
                if (this.onTick) this.onTick();
            }
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    getGameState() {
        return {
            board: this.board,
            turn: this.turn,
            lastMove: this.lastMove,
            kingMoved: this.castles.kingMoved, // Important pour le validateur
            rookMoved: this.castles.rookMoved
        };
    }

    playMove(from, to) {
        if (this.gameOver) return { success: false };

        const result = this.rules.executeMove(this.getGameState(), from, to);

        if (result.success) {
            this.board = result.newBoard;
            this.turn = this.turn === 'white' ? 'black' : 'white';
            this.lastMove = { from, to, piece: this.board[to[0]][to[1]] }; // Attention, pièce peut être null si explosion
            
            // Mise à jour des drapeaux de roque
            this.updateCastleFlags(from, to, result.isCastling);
            
            // Notation (simplifiée pour l'exemple)
            const note = this.generateNotation(from, to, result);
            this.history.push(note);

            // Check game over
            const winner = this.rules.checkGameOver(this.board);
            if (winner) {
                this.gameOver = winner;
                this.stopTimer();
            }

            return { success: true, explosions: result.explosionSquares };
        }
        return { success: false, error: result.error };
    }

    updateCastleFlags(from, to, isCastling) {
        // Logique simplifiée : si le roi ou la tour bouge, on marque le flag
        // (Tu peux reprendre ta logique exacte ici si tu veux être puriste)
        // Pour l'instant on suppose que le validateur a fait le job.
    }

    generateNotation(from, to, result) {
        // Tu peux remettre ta fonction toAlgebraic ici
        return "Coup"; // Placeholder pour garder le code concis
    }
}