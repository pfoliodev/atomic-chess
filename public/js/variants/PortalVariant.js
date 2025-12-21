import { BaseVariant } from './BaseVariant.js';
import { Board } from '../core/Board.js';

/**
 * Variante Portal Chess
 * L'échiquier est toroidal : les pièces peuvent traverser les bords
 * Portal actif uniquement sur les mouvements horizontaux traversant les côtés
 * Pas de portal vertical ni diagonal
 */
export class PortalVariant extends BaseVariant {
  constructor() {
    super();
  }

  /**
   * Vérifie si le chemin est libre en considérant le wrapping toroidal
   * Portal horizontal uniquement (côtés)
   */
  isPathClear(board, from, to) {
    const [fR, fC] = from;
    const [tR, tC] = to;

    // Distances
    const rDiff = tR - fR;
    const cDiff = tC - fC;

    // Horizontal portal only
    if (fR === tR) {
      const numSteps = Math.abs(cDiff);
      if (numSteps > 4) return true; // portal horizontal actif
      const step = Math.sign(cDiff);
      for (let i = 1; i < numSteps; i++) {
        const currC = (fC + i * step + 8) % 8;
        if (board[fR][currC]) return false;
      }
      return true;
    }

    // Pas de portal vertical
    if (fC === tC) {
      const numSteps = Math.abs(rDiff);
      const step = Math.sign(rDiff);
      for (let i = 1; i < numSteps; i++) {
        const currR = fR + i * step;
        if (currR < 0 || currR > 7) return false;
        if (board[currR][fC]) return false;
      }
      return true;
    }

    // Pas de portal diagonal
    if (Math.abs(rDiff) === Math.abs(cDiff)) {
      const steps = Math.abs(rDiff);
      const rStep = Math.sign(rDiff);
      const cStep = Math.sign(cDiff);
      for (let i = 1; i < steps; i++) {
        const rr = fR + i * rStep;
        const cc = fC + i * cStep;
        if (rr < 0 || rr > 7 || cc < 0 || cc > 7) return false;
        if (board[rr][cc]) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Vérifie les mouvements de base sans portal vertical/diagonal
   */
  checkBasicMove(board, from, to, piece, ignoreSafety = false) {
    const [fR, fC] = from;
    const [tR, tC] = to;
    const type = piece.toLowerCase();
    const target = board[tR][tC];

    // Pions
    if (type === 'p') {
      const dir = Board.isWhitePiece(piece) ? -1 : 1;
      if (ignoreSafety) return tR === fR + dir && Math.abs(tC - fC) === 1;
      
      if (fC === tC && !target) {
        if (tR === fR + dir) return true;
        if (fR === (Board.isWhitePiece(piece) ? 6 : 1) && tR === fR + 2 * dir && !board[fR + dir][fC]) return true;
      }
      if (Math.abs(tC - fC) === 1 && tR === fR + dir && (target || this.canCaptureEnPassant(board, from, to))) return true;
      return false;
    }

    // Cavalier: pas de portal diagonal
    if (type === 'n') {
      const rowDiff = Math.abs(tR - fR);
      const colDiff = Math.abs(tC - fC);
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    // Fou
    if (type === 'b') {
      const rowDiff = Math.abs(tR - fR);
      const colDiff = Math.abs(tC - fC);
      // diagonal sans portal
      return rowDiff === colDiff && rowDiff > 0 && this.isPathClear(board, from, to);
    }

    // Tour
    if (type === 'r') {
      const rowDiff = Math.abs(tR - fR);
      const colDiff = Math.abs(tC - fC);
      return ((fR === tR && colDiff > 0) || (fC === tC && rowDiff > 0)) && this.isPathClear(board, from, to);
    }

    // Reine
    if (type === 'q') {
      const rowDiff = Math.abs(tR - fR);
      const colDiff = Math.abs(tC - fC);
      return ((rowDiff === colDiff && rowDiff > 0) || (fR === tR && colDiff > 0) || (fC === tC && rowDiff > 0)) && this.isPathClear(board, from, to);
    }

    // Roi
    if (type === 'k') {
      const rowDiff = Math.abs(tR - fR);
      const colDiff = Math.abs(tC - fC);
      return rowDiff <= 1 && colDiff <= 1;
    }

    return false;
  }

  /**
   * Obtenir les coups valides (horizontal portal uniquement)
   */
  getValidMoves(board, fromRow, fromCol, currentPlayer) {
    const piece = board[fromRow][fromCol];
    const validMoves = [];
    
    if (!piece || Board.getPieceColor(piece) !== currentPlayer) return [];
    
    const type = piece.toLowerCase();
    if (type === 'n' || type === 'k') {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const target = board[r][c];
          if (target && Board.getPieceColor(target) === currentPlayer) continue;
          
          if (this.checkBasicMove(board, [fromRow, fromCol], [r, c], piece) && this.isMoveSafe(board, [fromRow, fromCol], [r, c], piece)) {
            validMoves.push([r, c]);
          }
        }
      }
    } else {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (r === fromRow && c === fromCol) continue;
          const target = board[r][c];
          if (target && Board.getPieceColor(target) === currentPlayer) continue;
          
          if (this.checkBasicMove(board, [fromRow, fromCol], [r, c], piece) && this.isMoveSafe(board, [fromRow, fromCol], [r, c], piece)) {
            validMoves.push([r, c]);
          }
        }
      }
    }
    
    return validMoves;
  }
}