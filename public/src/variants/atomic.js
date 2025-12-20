// src/variants/atomic.js

export class AtomicRules {
  constructor() {
    this.name = "Atomic Chess";
    this.description = "Capture = Explosion. Le roi ne peut pas capturer.";
  }

  // ---------------------------------------------------------
  // 1. INITIALISATION
  // ---------------------------------------------------------

  createInitialBoard() {
    return [
      ['r','n','b','q','k','b','n','r'],
      ['p','p','p','p','p','p','p','p'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['P','P','P','P','P','P','P','P'],
      ['R','N','B','Q','K','B','N','R']
    ];
  }

  // ---------------------------------------------------------
  // 2. LOGIQUE NUCLÉAIRE (La Spécificité)
  // ---------------------------------------------------------

  applyExplosion(board, [row, col]) {
    // On clone le plateau pour ne pas muter l'original directement
    const newBoard = board.map(r => [...r]);
    const explosionSquares = [[row, col]];
    
    // La pièce capturée disparaît
    newBoard[row][col] = null;

    // Les 8 voisins
    const neighbors = [
      [-1,-1], [-1,0], [-1,1],
      [0,-1],          [0,1],
      [1,-1],  [1,0],  [1,1]
    ];

    neighbors.forEach(([dR, dC]) => {
      const nR = row + dR; 
      const nC = col + dC;
      
      if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
        const piece = newBoard[nR][nC];
        // Règle Atomique : Les pions survivent aux explosions indirectes
        if (piece && piece.toLowerCase() !== 'p') { 
          newBoard[nR][nC] = null; 
          explosionSquares.push([nR, nC]); 
        }
      }
    });

    return { newBoard, explosionSquares };
  }

  // ---------------------------------------------------------
  // 3. EXÉCUTION D'UN COUP
  // ---------------------------------------------------------

  // Cette fonction est "pure" : elle prend un état et renvoie le suivant
  executeMove(gameState, from, to) {
    const { board, turn, castles } = gameState; // castles = { kingMoved, rookMoved... }
    const [fR, fC] = from;
    const [tR, tC] = to;
    const piece = board[fR][fC];
    
    // Vérification basique (au cas où l'UI a laissé passer un truc)
    if (!piece) return { success: false, error: "No piece" };

    const targetPiece = board[tR][tC];
    const isCapture = targetPiece !== null;
    const isEnPassant = this.isEnPassant(gameState, from, to);
    const isCastling = piece.toLowerCase() === 'k' && Math.abs(tC - fC) === 2;

    let newBoard = board.map(r => [...r]);
    let explosionSquares = [];

    // --- Gestion Capture / Explosion ---
    if (isCapture || isEnPassant) {
      const targetPos = isEnPassant 
        ? (this.isWhite(piece) ? [tR + 1, tC] : [tR - 1, tC]) 
        : [tR, tC];
      
      const explosion = this.applyExplosion(newBoard, targetPos);
      newBoard = explosion.newBoard;
      explosionSquares = explosion.explosionSquares;
      
      // La pièce qui attaque disparaît aussi dans l'explosion
      newBoard[fR][fC] = null; 
      
      // Cas spécifique En Passant : nettoyer le pion pris s'il n'a pas sauté
      if (isEnPassant) newBoard[targetPos[0]][targetPos[1]] = null;

    } else {
      // --- Mouvement Standard ---
      newBoard[tR][tC] = piece;
      newBoard[fR][fC] = null;

      // Gestion Roque
      if (isCastling) {
        const isKingSide = tC === 6;
        const rCol = isKingSide ? 7 : 0; // Tour départ
        const rTo = isKingSide ? 5 : 3;  // Tour arrivée
        newBoard[tR][rTo] = newBoard[tR][rCol];
        newBoard[tR][rCol] = null;
      }
      
      // Promotion (Auto Queen pour simplifier pour l'instant)
      if (piece.toLowerCase() === 'p' && (tR === 0 || tR === 7)) {
        newBoard[tR][tC] = this.isWhite(piece) ? 'Q' : 'q';
      }
    }

    // --- Vérification finale : Le roi est-il en vie / safe ? ---
    // En Atomic, on peut faire exploser le roi adverse.
    // Mais on ne peut pas faire exploser son PROPRE roi.
    const myKing = this.findKing(newBoard, turn);
    
    // Si mon roi n'existe plus après MON coup -> Suicide -> Interdit
    if (!myKing) return { success: false, error: "King suicide" };
    
    // Si mon roi est sous le feu après le coup -> Interdit
    if (this.isSquareAttacked(newBoard, myKing[0], myKing[1], turn)) {
        return { success: false, error: "King in check" };
    }

    return {
      success: true,
      newBoard,
      explosionSquares,
      isCastling,
      isCapture
    };
  }

  // ---------------------------------------------------------
  // 4. VALIDATION & UTILITAIRES (Helpers)
  // ---------------------------------------------------------

  getValidMoves(gameState, fromRow, fromCol) {
    const moves = [];
    const board = gameState.board;
    // On scanne tout le plateau (bourrin mais efficace pour 64 cases)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // On simule le coup pour voir s'il est légal
        // Note: C'est ici qu'on optimise si ça rame, mais pour l'instant Keep It Simple
        const attempt = this.executeMove(gameState, [fromRow, fromCol], [r, c]);
        
        // Il faut aussi vérifier que le mouvement géométrique de base est bon
        // (executeMove ne vérifie pas "comment" le cavalier bouge, il exécute juste)
        const basicValid = this.checkBasicMove(board, [fromRow, fromCol], [r, c], gameState.lastMove);
        
        if (basicValid && attempt.success) {
           moves.push([r, c]);
        }
      }
    }
    return moves;
  }

  checkBasicMove(board, from, to, lastMove, ignoreSafety = false) {
    const [fR, fC] = from; const [tR, tC] = to;
    const piece = board[fR][fC];
    if (!piece) return false;

    const rowDiff = Math.abs(tR - fR);
    const colDiff = Math.abs(tC - fC);
    const type = piece.toLowerCase();
    const target = board[tR][tC];

    // Logique standard des pièces (extraite de ton code original)
    if (type === 'p') {
      const dir = this.isWhite(piece) ? -1 : 1;
      const startRow = this.isWhite(piece) ? 6 : 1;
      
      // Avancer
      if (fC === tC && !target) {
        if (tR === fR + dir) return true;
        if (fR === startRow && tR === fR + 2 * dir && !board[fR + dir][fC]) return true;
      }
      // Capturer
      if (colDiff === 1 && tR === fR + dir) {
        if (target) return true;
        // En Passant check
        if (this.canCaptureEnPassant(lastMove, from, to, piece)) return true;
      }
      return false;
    }
    if (type === 'n') return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    if (type === 'b') return rowDiff === colDiff && this.isPathClear(board, from, to);
    if (type === 'r') return (fR === tR || fC === tC) && this.isPathClear(board, from, to);
    if (type === 'q') return (rowDiff === colDiff || fR === tR || fC === tC) && this.isPathClear(board, from, to);
    if (type === 'k') return rowDiff <= 1 && colDiff <= 1; // (Le roque est géré à part souvent, mais on peut l'ajouter ici si besoin)
    
    return false;
  }

  // --- Petits helpers techniques ---

  isWhite(piece) { return piece === piece.toUpperCase(); }
  
  isPathClear(board, [fR, fC], [tR, tC]) {
    const rStep = Math.sign(tR - fR);
    const cStep = Math.sign(tC - fC);
    let currR = fR + rStep;
    let currC = fC + cStep;
    while (currR !== tR || currC !== tC) {
      if (board[currR][currC]) return false;
      currR += rStep;
      currC += cStep;
    }
    return true;
  }

  isSquareAttacked(board, tR, tC, defenderColor) {
    const attackerColor = defenderColor === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && this.getPieceColor(p) === attackerColor) {
          // true à la fin pour "ignoreSafety" (on veut juste savoir si ça touche)
          if (this.checkBasicMove(board, [r, c], [tR, tC], null, true)) return true;
        }
      }
    }
    return false;
  }

  getPieceColor(p) { return this.isWhite(p) ? 'white' : 'black'; }

  findKing(board, color) {
    const target = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) { 
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === target) return [r, c]; 
        }
    }
    return null;
  }

  canCaptureEnPassant(lastMove, from, to, piece) {
    if (!lastMove || piece.toLowerCase() !== 'p') return false;
    const [lFR, lFC] = lastMove.from; 
    const [lTR, lTC] = lastMove.to;
    return lastMove.piece.toLowerCase() === 'p' 
        && Math.abs(lFR - lTR) === 2 
        && lTR === from[0] 
        && lTC === to[1];
  }

  isEnPassant(gameState, from, to) {
      // Wrapper simple pour appeler canCaptureEnPassant avec le contexte
      const piece = gameState.board[from[0]][from[1]];
      return this.canCaptureEnPassant(gameState.lastMove, from, to, piece);
  }

  checkGameOver(board) {
      const wK = this.findKing(board, 'white');
      const bK = this.findKing(board, 'black');
      if (!wK && !bK) return 'draw'; // Explosion mutuelle (rare mais possible ?)
      if (!wK) return 'black';
      if (!bK) return 'white';
      return null;
  }
}