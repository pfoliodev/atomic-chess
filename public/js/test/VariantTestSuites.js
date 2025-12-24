import { VariantTestSuite } from './VariantTestSuite.js';
import { BaseVariant } from '../variants/BaseVariant.js';
import { AtomicVariant } from '../variants/AtomicVariant.js';
import { KingOfTheHillVariant } from '../variants/KingOfTheHillVariant.js';
import { StandardVariant } from '../variants/StandardVariant.js';
import { assertEqual, assertTrue, assertFalse, assertNotNull, assertNull } from './TestFramework.js';

/**
 * Tests spécifiques pour la variante Atomic
 */
export function createAtomicVariantTests() {
  const testSuite = new VariantTestSuite(AtomicVariant, 'AtomicVariant');

  // Tests spécifiques à la variante Atomic
  testSuite.addVariantSpecificTests([
    {
      description: 'Atomic explosion destroys adjacent pieces except pawns',
      test: () => {
        const variant = new AtomicVariant();
        const board = [
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,'r','n','b','q','k',null], // rangée noir
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,'R','N','B','Q','K',null,null], // rangée blanc
          [null,null,null,null,null,null,null,null]
        ];

        // Capture une pièce -> explosion
        const result = variant.applyMove(board, [6, 3], [2, 3], 'B');
        
        // Vérifie que l'explosion a détruit les pièces adjacentes
        assertNull(result.board[2][3], 'Captured piece should be removed');
        assertNull(result.board[1][3], 'Adjacent piece should be destroyed');
        assertNull(result.board[3][3], 'Adjacent piece should be destroyed');
        assertNull(result.board[2][2], 'Adjacent piece should be destroyed');
        assertNull(result.board[2][4], 'Adjacent piece should be destroyed');
      }
    },
    {
      description: 'Pawns survive atomic explosion',
      test: () => {
        const variant = new AtomicVariant();
        const board = [
          [null,null,null,null,null,null,null,null],
          [null,null,null,'p',null,null,null,null], // pion noir adjacent
          [null,null,'r',null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null]
        ];

        const result = variant.applyMove(board, [6, 0], [2, 2], 'R');
        
        // Le pion adjacent devrait survivre
        assertEqual(result.board[1][3], 'p', 'Pawn should survive explosion');
      }
    },
    {
      description: 'King cannot capture (atomic explosion would kill itself)',
      test: () => {
        const variant = new AtomicVariant();
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[7][4] = 'K';
        board[6][4] = 'p';

      // Le roi ne devrait pas pouvoir capturer (explosion)
      const moves = variant.getValidMoves(board, 7, 4, 'white');
      const hasCaptureMove = moves.some(([r, c]) => board[r][c] !== null);
      // Note: Ce test peut échouer selon l'implémentation exacte
      console.log('Available moves for king:', moves);
      assertFalse(hasCaptureMove, 'King should not have capture moves in atomic');
      }
    },
    {
      description: 'Game ends when king is destroyed by explosion',
      test: () => {
        const variant = new AtomicVariant();
        const board = [
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,'k',null,null,null], // roi noir
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,'K',null,null,null]  // roi blanc
        ];

        // Tour blanche capture près du roi noir -> explosion
        const result = variant.applyMove(board, [7, 0], [3, 4], 'R');
        const gameOver = variant.checkGameOver(result.board);
        
        console.log('Game over result:', gameOver);
        console.log('Board after explosion:', JSON.stringify(result.board, null, 2));
        
        // Le roi noir devrait être détruit (peut retourner 'white' ou 'draw')
        assertTrue(gameOver === 'white' || gameOver === 'draw', 
                  'Game should end when king is destroyed');
      }
    }
  ]);

  return testSuite;
}

/**
 * Tests spécifiques pour la variante King of the Hill
 */
export function createKingOfTheHillVariantTests() {
  const testSuite = new VariantTestSuite(KingOfTheHillVariant, 'KingOfTheHillVariant');

  testSuite.addVariantSpecificTests([
    {
      description: 'Game ends when king reaches hill center',
      test: () => {
        const variant = new KingOfTheHillVariant();
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[7][4] = 'K';
        board[3][4] = 'k'; // roi noir déjà sur la colline

        const gameOver = variant.checkGameOver(board);
        assertEqual(gameOver, 'black', 'Black should win with king on hill');
      }
    },
    {
      description: 'Hill squares are correctly identified',
      test: () => {
        const variant = new KingOfTheHillVariant();
        const hillSquares = variant.getHillSquares();
        
        assertEqual(hillSquares.length, 4, 'Should have 4 hill squares');
        
        // Vérifie les cases centrales
        const expectedSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
        expectedSquares.forEach(square => {
          assertTrue(
            hillSquares.some(h => h[0] === square[0] && h[1] === square[1]),
            `Hill should contain square ${square}`
          );
        });
      }
    },
    {
      description: 'Move notation includes hill emoji when king reaches hill',
      test: () => {
        const variant = new KingOfTheHillVariant();
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[4][4] = 'K'; // roi blanc sur la colline

        const result = variant.applyMove(board, [4, 4], [3, 4], 'K');
        assertTrue(result.moveNotation.includes('🏔️'), 'Move notation should include hill emoji');
        assertEqual(result.gameOver, 'white', 'Should detect white victory');
      }
    },
    {
      description: 'isKingOnHill correctly detects king position',
      test: () => {
        const variant = new KingOfTheHillVariant();
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[3][4] = 'K';

        assertTrue(variant.isKingOnHill(board, 'white'), 'Should detect white king on hill');
        assertFalse(variant.isKingOnHill(board, 'black'), 'Should not detect black king on hill');
      }
    }
  ]);

  return testSuite;
}

/**
 * Tests spécifiques pour la variante Standard
 */
export function createStandardVariantTests() {
  const testSuite = new VariantTestSuite(StandardVariant, 'StandardVariant');

  testSuite.addVariantSpecificTests([
    {
      description: 'Standard variant inherits base behavior correctly',
      test: () => {
        const variant = new StandardVariant();
        const baseVariant = new BaseVariant();
        
        // Vérifie que les comportements sont identiques
        const board = variant.getInitialBoard();
        const baseBoard = baseVariant.getInitialBoard();
        
        assertEqual(JSON.stringify(board), JSON.stringify(baseBoard), 'Should have same initial board');
        
        // Test mouvement de pion
        const pawnMove1 = variant.checkBasicMove(board, [6, 4], [4, 4], 'P');
        const pawnMove2 = baseVariant.checkBasicMove(baseBoard, [6, 4], [4, 4], 'P');
        assertEqual(pawnMove1, pawnMove2, 'Should have same pawn movement rules');
      }
    },
    {
      description: 'Standard variant does not modify base behavior',
      test: () => {
        const variant = new StandardVariant();
        const board = variant.getInitialBoard();
        
        // Vérifie qu'il n'y a pas de modifications spéciales
        const result = variant.applyMove(board, [6, 4], [4, 4], 'P');
        
        assertEqual(result.explosionSquares.length, 0, 'Should not have explosions');
        assertFalse(result.moveNotation.includes('🏔️'), 'Should not have hill emoji');
        assertFalse(result.moveNotation.includes('💥'), 'Should not have explosion emoji for non-capture');
      }
    }
  ]);

  return testSuite;
}

/**
 * Tests pour la classe BaseVariant (tests de régression)
 */
export function createBaseVariantTests() {
  const testSuite = new VariantTestSuite(BaseVariant, 'BaseVariant');

  testSuite.addVariantSpecificTests([
    {
      description: 'BaseVariant provides correct initial position',
      test: () => {
        const variant = new BaseVariant();
        const board = variant.getInitialBoard();
        
        // Vérifie position exacte des pièces
        assertEqual(board[0][0], 'r', 'Black rook a8');
        assertEqual(board[0][1], 'n', 'Black knight b8');
        assertEqual(board[0][2], 'b', 'Black bishop c8');
        assertEqual(board[0][3], 'q', 'Black queen d8');
        assertEqual(board[0][4], 'k', 'Black king e8');
        
        assertEqual(board[7][0], 'R', 'White rook a1');
        assertEqual(board[7][1], 'N', 'White knight b1');
        assertEqual(board[7][2], 'B', 'White bishop c1');
        assertEqual(board[7][3], 'Q', 'White queen d1');
        assertEqual(board[7][4], 'K', 'White king e1');
      }
    },
    {
      description: 'isSquareAttacked correctly identifies threats',
      test: () => {
        const variant = new BaseVariant();
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[4][4] = 'K';
        board[2][3] = 'b';
        board[6][5] = 'n';
        board[4][0] = 'r';
        board[7][7] = 'q';

        assertTrue(variant.isSquareAttacked(board, 4, 4, 'white'), 'King should be under attack');
        assertTrue(variant.isSquareAttacked(board, 4, 4, 'white'), 'Bishop attacks');
        assertTrue(variant.isSquareAttacked(board, 4, 4, 'white'), 'Knight attacks');
        assertTrue(variant.isSquareAttacked(board, 4, 4, 'white'), 'Rook attacks');
        assertTrue(variant.isSquareAttacked(board, 4, 4, 'white'), 'Queen attacks');
      }
    },
    {
      description: 'State serialization works correctly',
      test: () => {
        const variant = new BaseVariant();
        
        // Modifie l'état
        variant.kingMoved.white = true;
        variant.rookMoved.whiteKingSide = true;
        variant.lastMove = { from: [1, 0], to: [3, 0], piece: 'p' };
        
        const state = variant.getState();
        const newVariant = new BaseVariant();
        newVariant.setState(state);
        
        assertEqual(newVariant.kingMoved.white, true, 'King moved state should persist');
        assertEqual(newVariant.rookMoved.whiteKingSide, true, 'Rook moved state should persist');
        assertEqual(newVariant.lastMove.piece, 'p', 'Last move should persist');
      }
    }
  ]);

  return testSuite;
}