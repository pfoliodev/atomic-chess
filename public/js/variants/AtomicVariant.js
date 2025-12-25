import { BaseVariant } from './BaseVariant.js';
import { Board } from '../core/Board.js';

/**
 * Variante Atomic Chess
 * Lors d'une capture, une explosion détruit toutes les pièces adjacentes (sauf les pions)
 */
export class AtomicVariant extends BaseVariant {
  constructor() {
    super();
  }

  /**
   * Applique une explosion atomique au plateau
   * @returns {Object} { newBoard, explosionSquares }
   */
  applyAtomicExplosion(board, capturePos) {
    const newBoard = Board.clone(board);
    const [row, col] = capturePos;

    const destroyedPieces = [];
    if (newBoard[row][col]) {
      destroyedPieces.push(newBoard[row][col]);
    }

    newBoard[row][col] = null;
    const explosionSquares = [[row, col]];

    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    neighbors.forEach(([dR, dC]) => {
      const nR = row + dR;
      const nC = col + dC;

      if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
        const piece = newBoard[nR][nC];
        // Les pions ne sont pas détruits par l'explosion
        if (piece && piece.toLowerCase() !== 'p') {
          destroyedPieces.push(piece);
          newBoard[nR][nC] = null;
          explosionSquares.push([nR, nC]);
        }
      }
    });

    return { newBoard, explosionSquares, destroyedPieces };
  }

  /**
   * Vérifie si un mouvement est légal dans les règles atomiques
   * Le roi ne peut pas capturer car il serait détruit par l'explosion
   */
  isMoveSafe(board, from, to, piece) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const isCapture = board[tR][tC] !== null;
    const isEP = this.canCaptureEnPassant(board, from, to);

    // Dans Atomic, le roi ne peut pas capturer (il serait détruit par l'explosion)
    if (piece.toLowerCase() === 'k' && (isCapture || isEP)) {
      return false;
    }

    // Utilise la simulation atomique pour vérifier la sécurité
    const futureBoard = this.getSimulatedBoard(board, from, to, piece);

    // Vérifie si le roi adverse existe encore (ex: variantes atomic)
    const opponentColor = Board.getPieceColor(piece) === 'white' ? 'black' : 'white';
    if (!Board.findKing(futureBoard, opponentColor)) return true;

    const myKingPos = Board.findKing(futureBoard, Board.getPieceColor(piece));
    if (!myKingPos) return false;

    return !this.isSquareAttacked(futureBoard, myKingPos[0], myKingPos[1], Board.getPieceColor(piece));
  }

  /**
   * Surcharge : Vérifie si la partie est terminée avec les règles atomiques
   */
  checkGameOver(board) {
    const wK = Board.findKing(board, 'white');
    const bK = Board.findKing(board, 'black');

    if (!wK && !bK) return 'draw';
    if (!wK) return 'black';
    if (!bK) return 'white';

    // Vérifie s'il y a échec et mat
    return this.checkAtomicCheckmate(board);
  }

  /**
   * Vérifie l'échec et mat dans les règles atomiques
   */
  checkAtomicCheckmate(board) {
    // Vérifie si le roi blanc est en échec
    if (this.isKingInCheck(board, 'white')) {
      if (!this.hasAnyLegalMove(board, 'white')) {
        return 'black';
      }
    }

    // Vérifie si le roi noir est en échec
    if (this.isKingInCheck(board, 'black')) {
      if (!this.hasAnyLegalMove(board, 'black')) {
        return 'white';
      }
    }

    // Vérifie le pat (pas d'échec mais aucun coup légal)
    if (!this.isKingInCheck(board, 'white') && !this.hasAnyLegalMove(board, 'white')) {
      return 'draw';
    }
    if (!this.isKingInCheck(board, 'black') && !this.hasAnyLegalMove(board, 'black')) {
      return 'draw';
    }

    return null;
  }

  /**
   * Vérifie si un roi est en échec
   */
  isKingInCheck(board, color) {
    const kingPos = Board.findKing(board, color);
    if (!kingPos) return false;

    return this.isSquareAttacked(board, kingPos[0], kingPos[1], color);
  }

  /**
   * Vérifie si une couleur a au moins un coup légal
   */
  hasAnyLegalMove(board, color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && Board.getPieceColor(piece) === color) {
          const validMoves = this.getValidMoves(board, r, c, color);
          if (validMoves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Surcharge : Simule un mouvement avec les règles atomiques
   */
  getSimulatedBoard(board, from, to, piece) {
    let simBoard = Board.clone(board);
    const [fR, fC] = from;
    const [tR, tC] = to;
    const isCapture = simBoard[tR][tC] !== null;
    const isEP = this.canCaptureEnPassant(board, from, to);

    if (isCapture || isEP) {
      // Détermine la position de capture (pour en passant)
      let capturePos;
      if (isEP) {
        capturePos = Board.isWhitePiece(piece) ? [tR + 1, tC] : [tR - 1, tC];
      } else {
        capturePos = [tR, tC];
      }

      // Applique l'explosion
      const { newBoard } = this.applyAtomicExplosion(simBoard, capturePos);
      simBoard = newBoard;
      simBoard[fR][fC] = null;
    } else {
      // Mouvement normal sans capture
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
   * Surcharge : Applique un mouvement avec les règles atomiques
   */
  applyMove(board, from, to, piece) {
    const [fR, fC] = from;
    const [tR, tC] = to;
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

    if (isCapture || isEP) moveNotation += " 💥";

    let newBoard;
    let explosionSquares = [];
    let destroyedPieces = [];

    if (isCapture || isEP) {
      // Détermine la position de capture
      const capturePos = isEP
        ? (Board.isWhitePiece(piece) ? [tR + 1, tC] : [tR - 1, tC])
        : [tR, tC];

      // Applique l'explosion atomique
      const result = this.applyAtomicExplosion(board, capturePos);
      newBoard = result.newBoard;
      explosionSquares = result.explosionSquares;
      destroyedPieces = result.destroyedPieces;
      newBoard[fR][fC] = null;
    } else {
      // Mouvement normal
      newBoard = Board.clone(board);
      newBoard[tR][tC] = piece;
      newBoard[fR][fC] = null;

      // Roque
      if (isCastling) {
        const rCol = tC === 6 ? 7 : 0;
        const rTo = tC === 6 ? 5 : 3;
        newBoard[tR][rTo] = newBoard[tR][rCol];
        newBoard[tR][rCol] = null;
      }
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
      explosionSquares,
      moveNotation,
      destroyedPieces
    };
  }
}
