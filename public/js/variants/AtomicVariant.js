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
    
    newBoard[row][col] = null;
    const explosionSquares = [[row, col]];
    
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    neighbors.forEach(([dR, dC]) => {
      const nR = row + dR;
      const nC = col + dC;
      
      if (nR >= 0 && nR < 8 && nC >= 0 && nC < 8) {
        const piece = newBoard[nR][nC];
        // Les pions ne sont pas détruits par l'explosion
        if (piece && piece.toLowerCase() !== 'p') {
          newBoard[nR][nC] = null;
          explosionSquares.push([nR, nC]);
        }
      }
    });
    
    return { newBoard, explosionSquares };
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
      const symbol = Board.pieceSymbols[piece].replace('\uFE0E','') || "";
      moveNotation = symbol + " " + Board.toAlgebraic(tR, tC);
    }
    
    if (isCapture || isEP) moveNotation += " 💥";
    
    let newBoard;
    let explosionSquares = [];
    
    if (isCapture || isEP) {
      // Détermine la position de capture
      const capturePos = isEP 
        ? (Board.isWhitePiece(piece) ? [tR + 1, tC] : [tR - 1, tC])
        : [tR, tC];
      
      // Applique l'explosion atomique
      const result = this.applyAtomicExplosion(board, capturePos);
      newBoard = result.newBoard;
      explosionSquares = result.explosionSquares;
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
      moveNotation
    };
  }
}
