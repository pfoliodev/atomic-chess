import { BaseVariant } from './BaseVariant.js';
import { Board } from '../core/Board.js';

/**
 * Variante King of the Hill (Roi de la Colline)
 * Le roi qui atteint l'une des 4 cases centrales (e4, d4, e5, d5) gagne instantanément
 */
export class KingOfTheHillVariant extends BaseVariant {
  constructor() {
    super();
    // Cases centrales qui font gagner : d4(3,3), e4(3,4), d5(4,3), e5(4,4)
    this.hillSquares = [
      [3, 3], // d4
      [3, 4], // e4
      [4, 3], // d5
      [4, 4]  // e5
    ];
  }

  /**
   * Vérifie si un roi est sur la colline (cases centrales)
   */
  isKingOnHill(board, color) {
    const kingPos = Board.findKing(board, color);
    if (!kingPos) return false;
    
    return this.hillSquares.some(([row, col]) => 
      kingPos[0] === row && kingPos[1] === col
    );
  }

  /**
   * Surcharge : Vérifie si la partie est terminée avec la règle du roi de la colline
   */
  checkGameOver(board) {
    // Vérifie d'abord si un roi est sur la colline
    if (this.isKingOnHill(board, 'white')) return 'white';
    if (this.isKingOnHill(board, 'black')) return 'black';
    
    // Sinon, utilise la logique standard (roi capturé)
    const wK = Board.findKing(board, 'white');
    const bK = Board.findKing(board, 'black');
    
    if (!wK && !bK) return 'draw';
    if (!wK) return 'black';
    if (!bK) return 'white';
    
    return null;
  }

  /**
   * Surcharge : Applique un mouvement et vérifie la victoire par colline
   */
  applyMove(board, from, to, piece) {
    const result = super.applyMove(board, from, to, piece);
    
    // Vérifie si ce mouvement place un roi sur la colline
    if (this.isKingOnHill(result.board, 'white')) {
      result.moveNotation += " 🏔️";
      result.gameOver = 'white';
    } else if (this.isKingOnHill(result.board, 'black')) {
      result.moveNotation += " 🏔️";
      result.gameOver = 'black';
    }
    
    return result;
  }

  /**
   * Retourne les cases de la colline pour l'affichage visuel
   */
  getHillSquares() {
    return this.hillSquares;
  }
}