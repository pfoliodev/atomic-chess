/**
 * Gère la communication avec le moteur Stockfish via un Web Worker
 */
export class StockfishEngine {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.onMoveFound = null;
        this.variant = 'atomic';
        this.difficulty = 1;

        // Skill levels Stockfish correspondants (0-20)
        this.skillLevels = [0, 2, 5, 8, 12, 15, 18, 20];
    }

    /**
     * Initialise le moteur
     */
    async init() {
        return new Promise((resolve) => {
            // Utilisation d'une version compatible variantes (via Fairy-Stockfish WASM)
            // Note: On utilise ici un lien vers un CDN fiable pour le worker
            this.worker = new Worker('https://cdn.jsdelivr.net/npm/@pychess/fairy-stockfish.wasm@latest/fairy-stockfish.js');

            this.worker.onmessage = (e) => {
                const line = e.data;
                console.log('Stockfish:', line);

                if (line === 'uciok') {
                    this.isReady = true;
                    // Configuration initiale
                    this.worker.postMessage(`setoption name UCI_Variant value ${this.variant}`);
                    this.setDifficulty(this.difficulty);
                    resolve();
                }

                if (line.startsWith('bestmove')) {
                    const move = line.split(' ')[1];
                    if (this.onMoveFound) {
                        this.onMoveFound(move);
                    }
                }
            };

            this.worker.postMessage('uci');
        });
    }

    /**
     * Définit la variante de jeu
     */
    setVariant(variant) {
        this.variant = variant === 'standard' ? 'chess' : variant;
        if (this.isReady) {
            this.worker.postMessage(`setoption name UCI_Variant value ${this.variant}`);
        }
    }

    /**
     * Définit la difficulté (1-8)
     */
    setDifficulty(level) {
        this.difficulty = Math.max(1, Math.min(8, level));
        if (this.isReady) {
            const skill = this.skillLevels[this.difficulty - 1];
            this.worker.postMessage(`setoption name Skill Level value ${skill}`);
        }
    }

    /**
     * Demande au moteur de chercher le meilleur coup
     */
    getBestMove(fen) {
        if (!this.isReady) return;

        console.log('Asking Stockfish for FEN:', fen);
        this.worker.postMessage(`position fen ${fen}`);

        // Temps de réflexion basé sur la difficulté
        const moveTime = this.difficulty * 250;
        this.worker.postMessage(`go movetime ${moveTime}`);
    }
}
