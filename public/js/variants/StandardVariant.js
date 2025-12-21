import { BaseVariant } from './BaseVariant.js';

/**
 * Variante Standard Chess (Échecs classiques)
 * Pas d'explosion, règles normales
 * 
 * EXEMPLE de nouvelle variante - montrant la facilité d'extension
 */
export class StandardVariant extends BaseVariant {
  constructor() {
    super();
  }

  // Hérite de toutes les méthodes de BaseVariant
  // Pas besoin de surcharger applyMove() ou getSimulatedBoard()
  // car les règles standard sont déjà implémentées dans BaseVariant
  
  // Si vous voulez des règles personnalisées, surchargez les méthodes :
  
  // checkGameOver(board) {
  //   // Par exemple : ajouter la détection de pat, mat, etc.
  //   const result = super.checkGameOver(board);
  //   if (result) return result;
  //   
  //   // Logique supplémentaire ici...
  //   return null;
  // }
}
