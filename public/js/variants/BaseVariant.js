import { Board } from '../core/Board.js';

/**
 * Classe abstraite définissant l'interface commune à toutes les variantes d'échecs
 */
export class BaseVariant {
  constructor() {
    this.kingMoved = { white: false, black: false };
    this.rookMoved = {
      whiteKingSide: false,
      whiteQueenSide: false,
      blackKingSide: false,
      blackQueenSide: false
    };
    this.lastMove = null;
  }

  /**
   * Retourne l'échiquier initial pour cette variante
   * @returns {Array<Array>} L'échiquier de départ
   */
  getInitialBoard() {
    return [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
  }

  /**
   * Vérifie les mouvements de base d'une pièce
   */
  checkBasicMove(board, from, to, piece, ignoreSafety = false) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const rowDiff = Math.abs(tR - fR);
    const colDiff = Math.abs(tC - fC);
    const type = piece.toLowerCase();
    const target = board[tR][tC];

    if (type === 'p') {
      const dir = Board.isWhitePiece(piece) ? -1 : 1;
      if (ignoreSafety) return tR === fR + dir && colDiff === 1;

      if (fC === tC && !target) {
        if (tR === fR + dir) return true;
        if (fR === (Board.isWhitePiece(piece) ? 6 : 1) && tR === fR + 2 * dir && !board[fR + dir][fC]) return true;
      }
      if (colDiff === 1 && tR === fR + dir && (target || this.canCaptureEnPassant(board, from, to))) return true;
      return false;
    }
    if (type === 'n') return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    if (type === 'b') return rowDiff === colDiff && Board.isPathClear(board, from, to);
    if (type === 'r') return (fR === tR || fC === tC) && Board.isPathClear(board, from, to);
    if (type === 'q') return (rowDiff === colDiff || fR === tR || fC === tC) && Board.isPathClear(board, from, to);
    if (type === 'k') return rowDiff <= 1 && colDiff <= 1;
    return false;
  }

  /**
   * Vérifie si une case est attaquée
   */
  isSquareAttacked(board, targetRow, targetCol, defenderColor) {
    const attackerColor = defenderColor === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && Board.getPieceColor(piece) === attackerColor) {
          if (this.checkBasicMove(board, [r, c], [targetRow, targetCol], piece, true)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Vérifie si le roque est possible
   */
  canCastle(board, color, side) {
    if (this.kingMoved[color]) return false;
    const row = color === 'white' ? 7 : 0;
    if (this.isSquareAttacked(board, row, 4, color)) return false;

    if (side === 'kingside') {
      if (this.rookMoved[color + 'KingSide'] || board[row][5] || board[row][6]) return false;
      return !this.isSquareAttacked(board, row, 5, color) && !this.isSquareAttacked(board, row, 6, color);
    } else {
      if (this.rookMoved[color + 'QueenSide'] || board[row][1] || board[row][2] || board[row][3]) return false;
      return !this.isSquareAttacked(board, row, 3, color) && !this.isSquareAttacked(board, row, 2, color);
    }
  }

  /**
   * Vérifie si la prise en passant est possible
   */
  canCaptureEnPassant(board, from, to) {
    if (!this.lastMove || board[from[0]][from[1]].toLowerCase() !== 'p') return false;
    const [lFR, lFC] = this.lastMove.from;
    const [lTR, lTC] = this.lastMove.to;
    return this.lastMove.piece.toLowerCase() === 'p' &&
      Math.abs(lFR - lTR) === 2 &&
      lTR === from[0] &&
      lTC === to[1];
  }

  /**
   * Vérifie si le mouvement laisse le roi en sécurité
   * À surcharger dans les variantes spécifiques si nécessaire
   */
  isMoveSafe(board, from, to, piece) {
    const myColor = Board.getPieceColor(piece);
    const futureBoard = this.getSimulatedBoard(board, from, to, piece);

    // Vérifie si le roi adverse existe encore (ex: variantes atomic)
    const opponentColor = myColor === 'white' ? 'black' : 'white';
    if (!Board.findKing(futureBoard, opponentColor)) return true;

    const myKingPos = Board.findKing(futureBoard, myColor);
    if (!myKingPos) return false;

    return !this.isSquareAttacked(futureBoard, myKingPos[0], myKingPos[1], myColor);
  }

  /**
   * Simule un mouvement et retourne le plateau résultant
   * À surcharger dans les variantes avec règles spéciales (ex: atomic)
   */
  getSimulatedBoard(board, from, to, piece) {
    let simBoard = Board.clone(board);
    const [fR, fC] = from;
    const [tR, tC] = to;
    const isCapture = simBoard[tR][tC] !== null;
    const isEP = this.canCaptureEnPassant(board, from, to);

    if (isCapture || isEP) {
      if (isEP) {
        const captureRow = Board.isWhitePiece(piece) ? tR + 1 : tR - 1;
        simBoard[captureRow][tC] = null;
      }
      simBoard[tR][tC] = piece;
      simBoard[fR][fC] = null;
    } else {
      simBoard[tR][tC] = piece;
      simBoard[fR][fC] = null;

      // Gestion du roque
      if (piece.toLowerCase() === 'k' && Math.abs(tC - fC) === 2) {
        const rCol = tC === 6 ? 7 : 0;
        const rTo = tC === 6 ? 5 : 3;
        simBoard[fR][rTo] = simBoard[fR][rCol];
        simBoard[fR][rCol] = null;
      }
    }

    return simBoard;
  }

  /**
   * Applique un mouvement et retourne le nouvel état
   * @returns {Object} { board, explosionSquares, moveNotation }
   */
  applyMove(board, from, to, piece) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const newBoard = Board.clone(board);
    const isCastling = piece.toLowerCase() === 'k' && Math.abs(tC - fC) === 2;
    const isCapture = board[tR][tC] !== null;
    const isEP = this.canCaptureEnPassant(board, from, to);

    // Notation algébrique
    let moveNotation;
    if (isCastling) {
      moveNotation = tC === 6 ? "O-O" : "O-O-O";
    } else {
      const symbol = Board.pieceSymbols[piece].replace('\uFE0E', '') || "";
      moveNotation = symbol + " " + Board.toAlgebraic(tR, tC);
    }

    if (isCapture) moveNotation += " 💥";

    // Application du mouvement
    if (isEP) {
      const captureRow = Board.isWhitePiece(piece) ? tR + 1 : tR - 1;
      newBoard[captureRow][tC] = null;
    }

    newBoard[tR][tC] = piece;
    newBoard[fR][fC] = null;

    // Roque
    if (isCastling) {
      const rCol = tC === 6 ? 7 : 0;
      const rTo = tC === 6 ? 5 : 3;
      newBoard[tR][rTo] = newBoard[tR][rCol];
      newBoard[tR][rCol] = null;
    }

    // Promotion
    if (piece.toLowerCase() === 'p' && (tR === 0 || tR === 7)) {
      newBoard[tR][tC] = Board.isWhitePiece(piece) ? 'Q' : 'q';
    }

    // Mise à jour des flags
    if (piece.toLowerCase() === 'k') {
      this.kingMoved[Board.getPieceColor(piece)] = true;
    }
    if (piece.toLowerCase() === 'r') {
      if (fR === 7 && fC === 0) this.rookMoved.whiteQueenSide = true;
      else if (fR === 7 && fC === 7) this.rookMoved.whiteKingSide = true;
      else if (fR === 0 && fC === 0) this.rookMoved.blackQueenSide = true;
      else if (fR === 0 && fC === 7) this.rookMoved.blackKingSide = true;
    }

    this.lastMove = { from, to, piece };

    return {
      board: newBoard,
      explosionSquares: [],
      moveNotation
    };
  }

  /**
   * Obtient tous les coups valides pour une case donnée
   */
  getValidMoves(board, fromRow, fromCol, currentPlayer) {
    const piece = board[fromRow][fromCol];
    const validMoves = [];

    if (!piece || Board.getPieceColor(piece) !== currentPlayer) return [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const target = board[r][c];
        if (target && Board.getPieceColor(target) === currentPlayer) continue;

        let possible = false;

        if (piece.toLowerCase() === 'k' && Math.abs(c - fromCol) === 2 && r === fromRow) {
          possible = this.canCastle(board, Board.getPieceColor(piece), c === 6 ? 'kingside' : 'queenside');
        } else {
          possible = this.checkBasicMove(board, [fromRow, fromCol], [r, c], piece);
        }

        if (possible && this.isMoveSafe(board, [fromRow, fromCol], [r, c], piece)) {
          validMoves.push([r, c]);
        }
      }
    }

    return validMoves;
  }

  /**
   * Vérifie si la partie est terminée
   * @returns {string|null} 'white', 'black', 'draw' ou null
   */
  checkGameOver(board) {
    const wK = Board.findKing(board, 'white');
    const bK = Board.findKing(board, 'black');

    if (!wK && !bK) return 'draw';
    if (!wK) return 'black';
    if (!bK) return 'white';

    return null;
  }

  /**
   * Réinitialise l'état de la variante
   */
  reset() {
    this.kingMoved = { white: false, black: false };
    this.rookMoved = {
      whiteKingSide: false,
      whiteQueenSide: false,
      blackKingSide: false,
      blackQueenSide: false
    };
    this.lastMove = null;
  }

  /**
   * Définit l'état de la variante (pour la synchronisation)
   */
  setState(state) {
    this.kingMoved = state.kingMoved || this.kingMoved;
    this.rookMoved = state.rookMoved || this.rookMoved;
    this.lastMove = state.lastMove || this.lastMove;
  }

  /**
   * Récupère l'état de la variante
   */
  getState() {
    return {
      kingMoved: this.kingMoved,
      rookMoved: this.rookMoved,
      lastMove: this.lastMove
    };
  }
  /**
   * Récupère les flags pour la génération de FEN
   */
  getFENFlags() {
    let castling = '';
    if (!this.kingMoved.white) {
      if (!this.rookMoved.whiteKingSide) castling += 'K';
      if (!this.rookMoved.whiteQueenSide) castling += 'Q';
    }
    if (!this.kingMoved.black) {
      if (!this.rookMoved.blackKingSide) castling += 'k';
      if (!this.rookMoved.blackQueenSide) castling += 'q';
    }
    if (!castling) castling = '-';

    let enPassant = '-';
    if (this.lastMove && this.lastMove.piece.toLowerCase() === 'p') {
      const [fR, fC] = this.lastMove.from;
      const [tR, tC] = this.lastMove.to;
      if (Math.abs(fR - tR) === 2) {
        const epRow = (fR + tR) / 2;
        enPassant = Board.toAlgebraic(epRow, tC);
      }
    }

    return { castling, enPassant };
  }
}
