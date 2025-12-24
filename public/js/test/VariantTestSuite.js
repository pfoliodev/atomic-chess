import { TestSuite, assert, assertEqual, assertTrue, assertFalse, assertNotNull, assertNull } from './TestFramework.js';
import { Board } from '../core/Board.js';

/**
 * Classe de test abstraite pour toutes les variantes d'échecs
 * Fournit des tests communs et un framework pour ajouter des tests spécifiques
 */
export class VariantTestSuite {
  constructor(variantClass, variantName) {
    this.variantClass = variantClass;
    this.variantName = variantName;
    this.testSuite = new TestSuite(`${variantName} Tests`);
    this.setupCommonTests();
  }

  /**
   * Configure les tests communs à toutes les variantes
   */
  setupCommonTests() {
    // Test 1: Initialisation
    this.testSuite.test(`${this.variantName} - Initialization`, () => {
      const variant = new this.variantClass();
      assertNotNull(variant, `${this.variantName} should instantiate`);
      assertTrue(variant instanceof this.variantClass, 'Should be correct instance');
      this.testVariantSpecificInitialState(variant);
    });

    // Test 2: Échiquier initial
    this.testSuite.test(`${this.variantName} - Initial board setup`, () => {
      const variant = new this.variantClass();
      const board = variant.getInitialBoard();
      this.validateInitialBoard(board);
    });

    // Test 3: Mouvements de base des pièces
    this.testSuite.test(`${this.variantName} - Basic piece movements`, () => {
      const variant = new this.variantClass();
      this.testBasicPieceMovements(variant);
    });

    // Test 4: Sécurité des mouvements
    this.testSuite.test(`${this.variantName} - Move safety validation`, () => {
      const variant = new this.variantClass();
      this.testMoveSafety(variant);
    });

    // Test 5: Détection de fin de partie
    this.testSuite.test(`${this.variantName} - Game over detection`, () => {
      const variant = new this.variantClass();
      this.testGameOverDetection(variant);
    });

    // Test 6: Application des mouvements
    this.testSuite.test(`${this.variantName} - Move application`, () => {
      const variant = new this.variantClass();
      this.testMoveApplication(variant);
    });

    // Test 7: Roque
    this.testSuite.test(`${this.variantName} - Castling`, () => {
      const variant = new this.variantClass();
      this.testCastling(variant);
    });

    // Test 8: Prise en passant
    this.testSuite.test(`${this.variantName} - En passant`, () => {
      const variant = new this.variantClass();
      this.testEnPassant(variant);
    });

    // Test 9: Génération de coups valides
    this.testSuite.test(`${this.variantName} - Valid moves generation`, () => {
      const variant = new this.variantClass();
      this.testValidMovesGeneration(variant);
    });

    // Test 10: État et synchronisation
    this.testSuite.test(`${this.variantName} - State management`, () => {
      const variant = new this.variantClass();
      this.testStateManagement(variant);
    });
  }

  /**
   * Valide l'échiquier initial
   */
  validateInitialBoard(board) {
    assertNotNull(board, 'Initial board should not be null');
    assertEqual(board.length, 8, 'Board should have 8 rows');
    assertEqual(board[0].length, 8, 'Board should have 8 columns');

    // Vérifie la présence des rois
    let whiteKing = false, blackKing = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece === 'K') whiteKing = true;
        if (piece === 'k') blackKing = true;
      }
    }
    assertTrue(whiteKing, 'White king should exist');
    assertTrue(blackKing, 'Black king should exist');
  }

  /**
   * Teste les mouvements de base des pièces
   */
  testBasicPieceMovements(variant) {
    const board = variant.getInitialBoard();
    
    // Test pion blanc
    assertTrue(variant.checkBasicMove(board, [6, 4], [4, 4], 'P'), 'White pawn 2 squares');
    assertTrue(variant.checkBasicMove(board, [6, 4], [5, 4], 'P'), 'White pawn 1 square');
    
    // Test pion noir
    assertTrue(variant.checkBasicMove(board, [1, 4], [3, 4], 'p'), 'Black pawn 2 squares');
    assertTrue(variant.checkBasicMove(board, [1, 4], [2, 4], 'p'), 'Black pawn 1 square');
    
    // Test cavalier
    assertTrue(variant.checkBasicMove(board, [7, 1], [5, 0], 'N'), 'Knight L-move 1');
    assertTrue(variant.checkBasicMove(board, [7, 1], [5, 2], 'N'), 'Knight L-move 2');
    
    // Test mouvements invalides
    assertFalse(variant.checkBasicMove(board, [6, 4], [4, 5], 'P'), 'Pawn cannot move diagonally without capture');
  }

  /**
   * Teste la sécurité des mouvements
   */
  testMoveSafety(variant) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[7][4] = 'K'; // Roi blanc
    board[0][4] = 'k'; // Roi noir
    board[7][0] = 'R'; // Tour blanche
    
    // Test mouvement sûr
    assertTrue(variant.isMoveSafe(board, [7, 0], [6, 0], 'R'), 'Safe rook move');
    
    // Test mise en échec
    board[6][4] = 'r'; // Tour noire menaçant le roi
    assertFalse(variant.isMoveSafe(board, [7, 3], [6, 3], 'K'), 'King cannot move into check');
  }

  /**
   * Teste la détection de fin de partie
   */
  testGameOverDetection(variant) {
    const board = variant.getInitialBoard();
    assertNull(variant.checkGameOver(board), 'Game should not be over initially');
    
    // Test capture de roi
    const boardWithoutBlackKing = Board.clone(board);
    boardWithoutBlackKing[0][4] = null;
    const result = variant.checkGameOver(boardWithoutBlackKing);
    assertTrue(result === 'white' || result === 'draw', 'Should detect black king capture');
  }

  /**
   * Teste l'application des mouvements
   */
  testMoveApplication(variant) {
    const board = variant.getInitialBoard();
    const result = variant.applyMove(board, [6, 4], [4, 4], 'P');
    
    assertNotNull(result, 'Move result should not be null');
    assertNotNull(result.board, 'Result should have board');
    assertNotNull(result.moveNotation, 'Result should have notation');
    assertEqual(result.board[4][4], 'P', 'Pawn should be moved');
    assertNull(result.board[6][4], 'Source should be empty');
  }

  /**
   * Teste le roque
   */
  testCastling(variant) {
    const baseBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    baseBoard[7][4] = 'K';
    baseBoard[7][0] = 'R';
    baseBoard[7][7] = 'R';
    baseBoard[0][4] = 'k';
    baseBoard[0][0] = 'r';
    baseBoard[0][7] = 'r';
    
    // Test roque possible (dépend de la variante)
    const canCastleKingside = variant.canCastle(baseBoard, 'white', 'kingside');
    const canCastleQueenside = variant.canCastle(baseBoard, 'white', 'queenside');
    
    // Le roque peut être désactivé dans certaines variantes
    // Le test vérifie juste que la méthode fonctionne
    assertTrue(typeof canCastleKingside === 'boolean', 'canCastle should return boolean');
    assertTrue(typeof canCastleQueenside === 'boolean', 'canCastle should return boolean');
  }

  /**
   * Teste la prise en passant
   */
  testEnPassant(variant) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[4][4] = 'P';
    board[3][4] = 'p';
    
    variant.lastMove = { from: [1, 4], to: [3, 4], piece: 'p' };
    
    const canCaptureEP = variant.canCaptureEnPassant(board, [4, 4], [3, 5]);
    assertTrue(typeof canCaptureEP === 'boolean', 'canCaptureEnPassant should return boolean');
  }

  /**
   * Teste la génération de coups valides
   */
  testValidMovesGeneration(variant) {
    const board = variant.getInitialBoard();
    const moves = variant.getValidMoves(board, 6, 4, 'white');
    
    assertTrue(Array.isArray(moves), 'getValidMoves should return array');
    assertTrue(moves.length >= 2, 'Pawn should have at least 2 initial moves');
    
    // Test format des coups
    moves.forEach(move => {
      assertEqual(move.length, 2, 'Move should have 2 coordinates');
      assertTrue(move[0] >= 0 && move[0] < 8, 'Row should be valid');
      assertTrue(move[1] >= 0 && move[1] < 8, 'Column should be valid');
    });
  }

  /**
   * Teste la gestion de l'état
   */
  testStateManagement(variant) {
    // Test reset
    variant.reset();
    const initialState = variant.getState();
    assertNotNull(initialState, 'State should not be null after reset');
    
    // Test setState/getState
    const testState = {
      kingMoved: { white: true, black: false },
      rookMoved: { whiteKingSide: true, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      lastMove: { from: [0, 0], to: [0, 1], piece: 'P' }
    };
    
    variant.setState(testState);
    const retrievedState = variant.getState();
    assertEqual(retrievedState.kingMoved.white, true, 'State should be preserved');
    assertEqual(retrievedState.lastMove.piece, 'P', 'Last move should be preserved');
  }

  /**
   * Test spécifique à l'état initial de la variante (à surcharger)
   */
  testVariantSpecificInitialState(variant) {
    // Par défaut, pas de test spécifique
    // Les variantes peuvent surcharger cette méthode
  }

  /**
   * Ajoute des tests spécifiques à la variante
   */
  addVariantSpecificTest(description, testFn) {
    this.testSuite.test(`${this.variantName} - ${description}`, testFn);
  }

  /**
   * Ajoute plusieurs tests spécifiques
   */
  addVariantSpecificTests(tests) {
    tests.forEach(({ description, test }) => {
      this.addVariantSpecificTest(description, test);
    });
  }

  /**
   * Exécute tous les tests
   */
  async run() {
    return await this.testSuite.run();
  }
}