import { BaseVariant } from './BaseVariant.js';
import { Board } from '../core/Board.js';

export class BattleRoyaleVariant extends BaseVariant {
  constructor() {
    super();
    this.turnCount = 0;
    this.turnsPerShrink = 10; // 5 tours complets (White + Black = 10 coups)
    this.collapsedRings = 0; // Combien d'anneaux sont détruits
    this.maxRings = 3; // Jusqu'au 2x2 central
  }

  /**
   * Vérifie si une case est dans la "Zone" (détruite)
   */
  isSquareCollapsed(row, col) {
    const min = this.collapsedRings;
    const max = 7 - this.collapsedRings;
    return row < min || row > max || col < min || col > max;
  }

  /**
   * Surcharge : On interdit de se déplacer dans la zone morte
   */
  checkBasicMove(board, from, to, piece, ignoreSafety = false) {
    // Si la case cible est détruite, c'est non !
    if (this.isSquareCollapsed(to[0], to[1])) return false;
    return super.checkBasicMove(board, from, to, piece, ignoreSafety);
  }

  /**
   * Applique le mouvement et gère la tempête
   */
  applyMove(board, from, to, piece) {
    // 1. Appliquer le mouvement normal
    const result = super.applyMove(board, from, to, piece);
    
    // 2. Incrémenter le compteur
    this.turnCount++;
    const turnsRemaining = this.turnsPerShrink - (this.turnCount % this.turnsPerShrink);
    
    // Notation : on ajoute un petit compte à rebours visuel dans l'historique
    if (turnsRemaining <= 3 && turnsRemaining > 0) {
      result.moveNotation += ` ⏳${turnsRemaining}`;
    }

    // 3. Vérifier si la zone rétrécit
    if (this.turnCount > 0 && this.turnCount % this.turnsPerShrink === 0 && this.collapsedRings < this.maxRings) {
      this.shrinkBoard(result.board);
      this.collapsedRings++;
      result.moveNotation += " 🌪️"; // Indique que la tempête a frappé
      
      // On vérifie immédiatement si un roi est mort
      const winner = this.checkGameOver(result.board);
      if (winner) {
        result.gameOver = winner;
      }
    }

    return result;
  }

  /**
   * Détruit les pièces dans l'anneau extérieur actuel
   */
  shrinkBoard(board) {
    // L'anneau actuel qui va être détruit
    const ring = this.collapsedRings; 
    const limit = 7 - ring;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // Si on est sur le bord actuel (top, bottom, left, right)
        if (r === ring || r === limit || c === ring || c === limit) {
          // On ne touche pas aux cases déjà mortes (optimisation)
          if (r >= ring && r <= limit && c >= ring && c <= limit) {
             board[r][c] = null; // Adieu petite pièce 👋
          }
        }
      }
    }
  }

  /**
   * Surcharge : Le jeu s'arrête si un roi disparaît dans la tempête
   */
  checkGameOver(board) {
    const wK = Board.findKing(board, 'white');
    const bK = Board.findKing(board, 'black');
    
    // Si les deux meurent en même temps (très rare mais possible), match nul
    if (!wK && !bK) return 'draw';
    if (!wK) return 'black'; // Le roi blanc a fondu
    if (!bK) return 'white'; // Le roi noir a fondu
    
    return super.checkGameOver(board);
  }
  
  /**
   * Pour la synchro : on doit sauvegarder l'état de la tempête
   */
  getState() {
    return {
      ...super.getState(),
      turnCount: this.turnCount,
      collapsedRings: this.collapsedRings
    };
  }

  setState(state) {
    super.setState(state);
    this.turnCount = state.turnCount || 0;
    this.collapsedRings = state.collapsedRings || 0;
  }
}