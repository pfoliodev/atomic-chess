/**
 * Analyse les coups et fournit un feedback textuel basé sur l'évolution du score
 */
export class CoachAnalyzer {
    constructor() {
        this.lastEvaluation = { type: 'cp', value: 0 };
        this.dictionary = {
            brilliant: "Incroyable ! Vous avez trouvé une solution subtile.",
            excellent: "Excellent coup, vous renforcez votre emprise.",
            good: "Coup solide, vous gardez le contrôle.",
            inaccuracy: "Un peu imprécis. Il y avait une meilleure option.",
            mistake: "C'est une erreur. Vous perdez l'avantage.",
            blunder: "Grosse gaffe ! La position s'effondre.",
            mate: "Le moteur voit un réseau de mat forcé !",
            threat: "Attention ! Une menace sérieuse se profile.",
            atomicExplosion: "⚠️ ALERTE : Menace d'explosion atomique imminente sur votre Roi !",
            kothNearHill: "⚠️ DANGER : Le Roi adverse approche de la Colline !",
            brNearDeadZone: "⚠️ VITE : Votre Roi est trop près de la zone d'effondrement !",
            fork: "Bel œil ! Vous avez créé une attaque double (fourchette).",
            strategicAtomicThreat: "⚠️ PRUDENCE : L'adversaire prépare une explosion près de votre Roi !"
        };
    }

    /**
     * @param {Object} currentEval {type: 'cp'|'mate', value: number}
     * @param {string} turn 'white' or 'black'
     * @param {Object} context { board, variant, playerColor }
     * @param {boolean} threatsOnly Si vrai, ne renvoie que les alertes critiques
     * @returns {string} Message de feedback
     */
    analyze(currentEval, turn, context = {}, threatsOnly = false) {
        let message = "";

        // Alerte Atomic spécifique (prioritaire)
        if (context.variant === 'atomic') {
            if (this.detectAtomicThreat(context.board, context.playerColor)) {
                return this.dictionary.atomicExplosion;
            }
            // Nouvelle détection stratégique (coup qui prépare une menace)
            if (this.detectStrategicAtomicThreat(context.board, context.playerColor)) {
                return this.dictionary.strategicAtomicThreat;
            }
        }

        // Alerte KOTH
        if (context.variant === 'kingofthehill' && this.detectKOTHThreat(context.board, context.playerColor)) {
            return this.dictionary.kothNearHill;
        }

        // Alerte Battle Royale
        if (context.variant === 'battleroyale' && this.detectBRThreat(context.board, context.playerColor, context.collapsedRings)) {
            return this.dictionary.brNearDeadZone;
        }

        // Détection de tactiques (Fourchettes) - seulement si ce n'est pas déjà un blâme
        if (this.detectFork(context.board, context.playerColor, context.lastMove)) {
            return this.dictionary.fork;
        }

        // Si on est en mode "menaces uniquement" (après coup de l'IA), et qu'aucune menace n'est détectée
        if (threatsOnly) {
            this.lastEvaluation = currentEval;
            return null; // Ne rien dire si l'IA a juste fait un coup normal
        }

        // Gestion du mat
        if (currentEval.type === 'mate') {
            return this.dictionary.mate;
        }

        // Si l'évaluation précédente était un mat et qu'on revient en cp, 
        // c'est souvent une gaffe (on a laissé échapper le mat).
        if (this.lastEvaluation.type === 'mate' && currentEval.type === 'cp') {
            this.lastEvaluation = currentEval;
            return this.dictionary.blunder;
        }

        // Calcul du delta
        // Pour les blancs, un score qui augmente est positif.
        // Pour les noirs, un score qui diminue est positif.
        let delta = currentEval.value - this.lastEvaluation.value;
        if (turn === 'black') delta = -delta;

        if (delta > 150) message = this.dictionary.brilliant;
        else if (delta > 50) message = this.dictionary.excellent;
        else if (delta > -20) message = this.dictionary.good;
        else if (delta > -100) message = this.dictionary.inaccuracy;
        else if (delta > -300) message = this.dictionary.mistake;
        else message = this.dictionary.blunder;

        this.lastEvaluation = currentEval;
        return message;
    }

    /**
     * Définit l'évaluation de départ avant le coup du joueur
     */
    setBaseEvaluation(evaluation) {
        this.lastEvaluation = evaluation;
    }

    /**
     * Détecte si une pièce adverse peut exploser à côté du roi au prochain coup
     */
    detectAtomicThreat(board, playerColor) {
        const kingPos = this.findPiece(board, playerColor === 'white' ? 'K' : 'k');
        if (!kingPos) return false;

        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        const [kR, kC] = kingPos;

        // Parcourir les 8 cases autour du roi
        for (let dR = -1; dR <= 1; dR++) {
            for (let dC = -1; dC <= 1; dC++) {
                if (dR === 0 && dC === 0) continue;
                const nR = kR + dR;
                const nC = kC + dC;

                if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                    // Si la case contient une pièce adverse, elle ne peut pas être capturée pour exploser
                    // MAIS en Atomic, le roi meurt si n'importe quelle pièce ADJACENTE est capturée.
                    // On vérifie si l'adversaire peut attaquer cette case (nR, nC)
                    if (this.isSquareAttackedBy(board, nR, nC, opponentColor)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    findPiece(board, pieceChar) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === pieceChar) return [r, c];
            }
        }
        return null;
    }

    isSquareAttackedBy(board, targetR, targetC, attackerColor) {
        const isWhiteAttacker = attackerColor === 'white';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && (isWhiteAttacker ? piece === piece.toUpperCase() : piece === piece.toLowerCase())) {
                    if (this.canPieceReach(board, [r, c], [targetR, targetC], piece)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    canPieceReach(board, from, to, piece) {
        const [fR, fC] = from;
        const [tR, tC] = to;
        const rowDiff = Math.abs(tR - fR);
        const colDiff = Math.abs(tC - fC);
        const type = piece.toLowerCase();

        // Note: Heuristique simplifiée pour le coach
        if (type === 'p') {
            const dir = (piece === 'P') ? -1 : 1;
            return tR === fR + dir && colDiff === 1; // Un pion attaque seulement en diagonale
        }
        if (type === 'n') return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        if (type === 'b') return rowDiff === colDiff && this.isPathClear(board, from, to);
        if (type === 'r') return (fR === tR || fC === tC) && this.isPathClear(board, from, to);
        if (type === 'q') return (rowDiff === colDiff || fR === tR || fC === tC) && this.isPathClear(board, from, to);
        if (type === 'k') return rowDiff <= 1 && colDiff <= 1;
        return false;
    }

    isPathClear(board, from, to) {
        const [fR, fC] = from;
        const [tR, tC] = to;
        const dR = Math.sign(tR - fR);
        const dC = Math.sign(tC - fC);
        let currR = fR + dR;
        let currC = fC + dC;
        while (currR !== tR || currC !== tC) {
            if (board[currR][currC]) return false;
            currR += dR;
            currC += dC;
        }
        return true;
    }

    /**
     * Détecte si le roi adverse est à un pas du centre (d4, d5, e4, e5)
     */
    detectKOTHThreat(board, playerColor) {
        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        const opponentKingPos = this.findPiece(board, opponentColor === 'white' ? 'K' : 'k');
        if (!opponentKingPos) return false;

        const [r, c] = opponentKingPos;
        // On vérifie si le roi adverse est à 1 case de distance du carré central [3,3] à [4,4]
        for (let targetR = 3; targetR <= 4; targetR++) {
            for (let targetC = 3; targetC <= 4; targetC++) {
                if (Math.abs(r - targetR) <= 1 && Math.abs(c - targetC) <= 1) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Détecte si le propre roi est sur le point d'être absorbé par la zone morte
     */
    detectBRThreat(board, playerColor, collapsedRings) {
        const kingPos = this.findPiece(board, playerColor === 'white' ? 'K' : 'k');
        if (!kingPos) return false;

        const [r, c] = kingPos;
        const nextCollapsed = (collapsedRings || 0) + 1;

        // Si le roi sera dans la nouvelle zone morte après le prochain effondrement
        const min = nextCollapsed;
        const max = 7 - nextCollapsed;

        const willBeDead = r < min || r > max || c < min || c > max;
        return willBeDead;
    }

    /**
     * Détecte une fourchette (une pièce attaque deux cibles de valeur)
     */
    detectFork(board, playerColor, lastMove) {
        if (!lastMove || !lastMove.to || !Array.isArray(lastMove.to)) return false;
        const [toR, toC] = lastMove.to;
        const piece = board[toR][toC];
        if (!piece || this.getPieceColor(piece) !== playerColor) return false;

        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        let attackCount = 0;

        // On parcourt tout l'échiquier pour voir ce que la pièce bougée attaque
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const target = board[r][c];
                if (target && this.getPieceColor(target) === opponentColor) {
                    // Si la pièce bougée peut capturer cette cible
                    // On utilise le même format : (board, [fromR, fromC], [toR, toC], piece)
                    if (this.canPieceReach(board, [toR, toC], [r, c], piece)) {
                        // On compte si c'est une pièce "intéressante"
                        const type = target.toLowerCase();
                        if (type !== 'p' || attackCount > 0) {
                            attackCount++;
                        }
                    }
                }
            }
        }

        return attackCount >= 2;
    }

    /**
     * Helper pour savoir si une pièce à (fromR, fromC) peut atteindre (toR, toC)
     */
    canPieceReach(board, from, to, piece) {
        if (!from || !to || !piece) return false;
        const [fR, fC] = from;
        const [tR, tC] = to;

        // Sécurité out of bounds
        if (fR < 0 || fR >= 8 || fC < 0 || fC >= 8 || tR < 0 || tR >= 8 || tC < 0 || tC >= 8) return false;

        const rowDiff = Math.abs(tR - fR);
        const colDiff = Math.abs(tC - fC);
        const type = piece.toLowerCase();

        if (type === 'p') {
            const color = (piece === piece.toUpperCase()) ? 'white' : 'black';
            const forward = color === 'white' ? -1 : 1;
            return tR === fR + forward && colDiff === 1;
        }
        if (type === 'n') {
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        }
        if (type === 'b') {
            if (rowDiff !== colDiff) return false;
            return this.isPathClear(board, from, to);
        }
        if (type === 'r') {
            if (fR !== tR && fC !== tC) return false;
            return this.isPathClear(board, from, to);
        }
        if (type === 'q') {
            if (rowDiff !== colDiff && fR !== tR && fC !== tC) return false;
            return this.isPathClear(board, from, to);
        }
        if (type === 'k') {
            return rowDiff <= 1 && colDiff <= 1;
        }
        return false;
    }

    isPathClear(board, from, to) {
        const [fR, fC] = from;
        const [tR, tC] = to;
        const stepR = Math.sign(tR - fR);
        const stepC = Math.sign(tC - fC);
        let currR = fR + stepR;
        let currC = fC + stepC;
        while (currR !== tR || currC !== tC) {
            if (currR < 0 || currR >= 8 || currC < 0 || currC >= 8 || board[currR][currC]) return false;
            currR += stepR;
            currC += stepC;
        }
        return true;
    }

    getPieceColor(piece) {
        return piece === piece.toUpperCase() ? 'white' : 'black';
    }

    /**
     * Détecte si une pièce adverse peut se déplacer vers une case qui menacerait le roi au tour suivant
     */
    detectStrategicAtomicThreat(board, playerColor) {
        const kingPos = this.findPiece(board, playerColor === 'white' ? 'K' : 'k');
        if (!kingPos) return false;

        const opponentColor = playerColor === 'white' ? 'black' : 'white';
        const [kR, kC] = kingPos;

        // On identifie d'abord les cases critiques autour du roi
        const criticalSquares = [];
        for (let dR = -1; dR <= 1; dR++) {
            for (let dC = -1; dC <= 1; dC++) {
                if (dR === 0 && dC === 0) continue;
                const nR = kR + dR;
                const nC = kC + dC;
                if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
                    criticalSquares.push([nR, nC]);
                }
            }
        }

        // On regarde si une pièce adverse peut atteindre une case d'où elle pourrait attaquer une case critique
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && this.getPieceColor(piece) === opponentColor) {
                    if (piece.toLowerCase() === 'p') continue;

                    for (let tR = 0; tR < 8; tR++) {
                        for (let tC = 0; tC < 8; tC++) {
                            if (this.canPieceReach(board, [r, c], [tR, tC], piece)) {
                                for (const [critR, critC] of criticalSquares) {
                                    if (this.canPieceReach(board, [tR, tC], [critR, critC], piece)) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}
