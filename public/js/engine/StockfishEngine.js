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
        this.candidateMoves = []; // Stocke les coups potentiels (MultiPV)
        this.collapsedRings = 0; // Pour Battle Royale
        this.currentFen = null; // FEN actuel pour validation
        this.currentEvaluation = { type: 'cp', value: 0 };
        this.onEvaluation = null; // Nouveau callback

        // Skill levels Stockfish correspondants (0-20)
        this.skillLevels = [0, 2, 5, 8, 12, 15, 18, 20];
    }

    /**
     * Initialise le moteur
     */
    async init() {
        if (this.worker) {
            this.worker.terminate();
        }
        return new Promise((resolve) => {
            this.worker = new Worker('./js/engine/stockfish.js');

            this.worker.onmessage = (e) => {
                const line = e.data;
                // console.log('Stockfish:', line); // Trop verbeux avec MultiPV

                if (line === 'uciok') {
                    this.isReady = true;
                    // Activation du support des variantes si nécessaire
                    if (this.variant !== 'chess' && this.variant !== 'standard') {
                        this.worker.postMessage(`setoption name UCI_Variant value ${this.variant}`);
                    }
                    // Pour Battle Royale, on veut plusieurs choix pour filtrer les coups suicidaires
                    if (this.variant === 'kingofthehill') {
                        this.worker.postMessage('setoption name MultiPV value 10');
                    }
                    this.setDifficulty(this.difficulty);
                    resolve();
                }

                // Parsing des infos du moteur (score, profondeur, etc.)
                if (line.startsWith('info')) {
                    const parts = line.split(' ');

                    // Parsing du score (prioritaire pour le coach)
                    const scoreIndex = parts.indexOf('score');
                    if (scoreIndex !== -1) {
                        const type = parts[scoreIndex + 1]; // 'cp' or 'mate'
                        const value = parseInt(parts[scoreIndex + 2]);
                        this.currentEvaluation = { type, value };

                        if (this.onEvaluation) {
                            this.onEvaluation(this.currentEvaluation);
                        }
                    }

                    // Parsing des coups candidats (MultiPV) s'ils sont présents
                    if (line.includes('pv')) {
                        const pvIndex = parts.indexOf('pv');
                        if (pvIndex !== -1 && pvIndex + 1 < parts.length) {
                            const move = parts[pvIndex + 1];
                            const multipvIndex = parts.indexOf('multipv');
                            if (multipvIndex !== -1) {
                                const rank = parseInt(parts[multipvIndex + 1]);
                                this.candidateMoves[rank - 1] = move;
                            } else {
                                this.candidateMoves[0] = move;
                            }
                        }
                    }
                }

                if (line.startsWith('bestmove')) {
                    let bestMove = line.split(' ')[1];

                    // Filtrage Battle Royale et Validation FEN
                    if (this.variant === 'battleroyale' && this.collapsedRings > 0 && this.currentFen) {
                        // console.log('Filtrage Battle Royale. Candidats:', this.candidateMoves);

                        // Parse FEN to verify pieces
                        const fenParts = this.currentFen.split(' ');
                        const boardStr = fenParts[0];
                        const turn = fenParts[1]; // 'w' or 'b'
                        const rows = boardStr.split('/');

                        // Chercher le premier coup valide
                        const validMove = this.candidateMoves.find(move => {
                            if (!move || move === '(none)') return false;

                            // 1. Décodage coordonnée Source
                            const fCol = move.charCodeAt(0) - 'a'.charCodeAt(0);
                            const fR = 8 - parseInt(move[1]); // 0-based index for rows array

                            // 2. Décodage coordonnée Cible
                            const tCol = move.charCodeAt(2) - 'a'.charCodeAt(0);
                            const tR = 8 - parseInt(move[3]);

                            // 3. Vérification de la Source (Pièce existante et bonne couleur ?)
                            const rowStr = rows[fR];
                            let colIdx = 0;
                            let piece = null;
                            for (let char of rowStr) {
                                if (isNaN(char)) { // Pièce
                                    if (colIdx === fCol) {
                                        piece = char;
                                        break;
                                    }
                                    colIdx++;
                                } else { // Chiffre
                                    colIdx += parseInt(char);
                                }
                                if (colIdx > fCol) break; // Passé la colonne
                            }

                            if (!piece) {
                                // console.warn(`Cinglé! Move ${move} part d'une case vide!`);
                                return false; // Case vide
                            }

                            const isWhite = piece === piece.toUpperCase();
                            if ((turn === 'w' && !isWhite) || (turn === 'b' && isWhite)) {
                                // console.warn(`Traitre! Move ${move} bouge pièce adverse!`);
                                return false; // Mauvaise couleur
                            }

                            // 4. Vérification de la Cible (Zone Morte ?)
                            const min = this.collapsedRings;
                            const max = 7 - this.collapsedRings;
                            const isDead = tR < min || tR > max || tCol < min || tCol > max;

                            return !isDead;
                        });

                        if (validMove) {
                            if (validMove !== bestMove) {
                                console.log(`Coup corrigé (Zone/Illégal): ${bestMove} -> ${validMove}`);
                                bestMove = validMove;
                            }
                        } else {
                            console.warn("Aucun coup sûr/légal trouvé !");
                        }
                    }

                    if (this.onMoveFound) {
                        this.onMoveFound(bestMove);
                    }
                    // Reset candidats
                    this.candidateMoves = [];
                    this.currentFen = null;
                }
            };

            this.worker.postMessage('uci');
        });
    }

    /**
     * Définit la variante de jeu
     */
    setVariant(variant) {
        if (variant === 'standard') {
            this.variant = 'chess';
        } else if (variant === 'battleroyale') {
            // Battle Royale n'est pas supporté nativement, on utilise King Of The Hill
            // car la stratégie est similaire : ramener le roi vers le centre.
            this.variant = 'kingofthehill';
        } else {
            this.variant = variant;
        }

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

        // Stratégie spéciale pour Battle Royale : survie du roi
        if (this.variant === 'kingofthehill') { // Mapped from battleroyale
            const bookMove = this.getBattleRoyaleBookMove(fen);
            if (bookMove) {
                console.log('Battle Royale Book Move:', bookMove);
                if (this.onMoveFound) {
                    this.onMoveFound(bookMove);
                }
                return;
            }

            // On retire les droits de roque pour éviter que l'IA ne se suicide dans les coins
            // FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
            const parts = fen.split(' ');
            parts[2] = '-'; // Pas de roque
            fen = parts.join(' ');
            this.currentFen = fen; // Memorise pour la validation
        }

        console.log('Asking Stockfish for FEN:', fen);
        this.worker.postMessage(`position fen ${fen}`);

        // Temps de réflexion basé sur la difficulté
        const moveTime = this.difficulty * 250;
        this.worker.postMessage(`go movetime ${moveTime}`);
    }

    /**
     * Livre d'ouverture forcé pour Battle Royale (The Bongcloud Opening)
     * But: Sortir le roi de la zone de danger (rangées 0 et 7) le plus vite possible
     */
    getBattleRoyaleBookMove(fen) {
        const parts = fen.split(' ');
        const board = parts[0];
        const turn = parts[1]; // 'w' or 'b'

        // 1. Ouvrir la voie pour le roi (Pion e2-e4 ou e7-e5)
        if (turn === 'w') {
            // Si le pion e2 est présent et le roi est en e1
            // rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
            // e2 est à l'index correspondant dans la chaine FEN... c'est complique à parser en regex simple
            // On regarde juste si on est au tout début
            if (board.includes('RNBQKBNR') && board.includes('PPPPPPPP')) {
                return 'e2e4';
            }
            // Si le roi est en e1 et la case e2 est vide (après e2e4)
            if (board.includes('4K3') || board.includes('3K4') || (board.match(/K/) && !board.match(/Q.*K/))) { // heuristique simple
                // C'est risqué de parser le FEN manuellement sans grid.
                // On va utiliser le compteur de coups du FEN
                const fullMove = parseInt(parts[5]);
                if (fullMove === 1) return 'e2e4';
                if (fullMove === 2) return 'e1e2';
            }
        } else {
            // Noir
            const fullMove = parseInt(parts[5]);
            // On vérifie que le pion est bien là avant de proposer le coup
            // FEN row 1 (indices 1 pour les noirs) : rnbqkbnr/pppppppp/8/...
            // e7 est le 5ème pion de la 2ème rangée
            const rows = board.split('/');
            if (rows.length === 8) {
                const row1 = rows[1]; // Rangée des pions noirs
                // On doit parser la rangée pour trouver e7 (index 4)
                let col = 0;
                let hasPawnE7 = false;
                for (let char of row1) {
                    if (isNaN(char)) { // Pièce
                        if (col === 4 && char === 'p') hasPawnE7 = true;
                        col++;
                    } else { // Chiffre (cases vides)
                        col += parseInt(char);
                    }
                }

                console.log(`[BR Book] Turn: b, FullMove: ${fullMove}, FEN: ${fen}, hasPawnE7: ${hasPawnE7}, row1: ${row1}`);

                // Si e7 est occupé par un pion, on joue e7-e5
                if (fullMove === 1 && hasPawnE7) {
                    console.log('[BR Book] Playing e7e5');
                    return 'e7e5';
                }

                // Vérifier roi en e8 pour le coup 2
                const row0 = rows[0];
                let hasKingE8 = false;
                col = 0;
                for (let char of row0) {
                    if (isNaN(char)) {
                        if (col === 4 && char === 'k') hasKingE8 = true;
                        col++;
                    } else {
                        col += parseInt(char);
                    }
                }
                if (fullMove === 2 && hasKingE8) return 'e8e7';
            }
        }

        return null;
    }
}
