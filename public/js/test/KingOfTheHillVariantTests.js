import { TestSuite, assert, assertEqual, assertTrue, assertFalse, assertNull } from './TestFramework.js';
import { KingOfTheHillVariant } from '../variants/KingOfTheHillVariant.js';
import { Board } from '../core/Board.js';

export const kingOfTheHillVariantTests = new TestSuite('KingOfTheHillVariant Tests');

// Test center squares
kingOfTheHillVariantTests.test('Center squares correctly identified', () => {
  const variant = new KingOfTheHillVariant();
  
  assertTrue(variant.isCenterSquare(3, 3), 'd4 is center square');
  assertTrue(variant.isCenterSquare(3, 4), 'e4 is center square');
  assertTrue(variant.isCenterSquare(4, 3), 'd5 is center square');
  assertTrue(variant.isCenterSquare(4, 4), 'e5 is center square');
  
  assertFalse(variant.isCenterSquare(3, 2), 'c4 is not center square');
  assertFalse(variant.isCenterSquare(2, 3), 'd3 is not center square');
});

// Test win condition
kingOfTheHillVariantTests.test('Win when king reaches center square', () => {
  const variant = new KingOfTheHillVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup: white king at center
  board[4][4] = 'K'; // White king at e5
  
  const result = variant.checkGameOver(board);
  assertEqual(result, 'white', 'White wins when king at center');
});

kingOfTheHillVariantTests.test('Black wins when king reaches center', () => {
  const variant = new KingOfTheHillVariant();
  const board = Array(8).fixll(null).map(() => Array(8).fill(null));
  
  // Setup: black king at center
  board[4][3] = 'k'; // Black king at d5
  
  const result = variant.checkGameOver(board);
  assertEqual(result, 'black', 'Black wins when king at center');
});

kingOfTheHillVariantTests.test('No winner when kings not at center', () => {
  const variant = new KingOfTheHillVariant();
  const board = variant.getInitialBoard();
  
  const result = variant.checkGameOver(board);
  assertNull(result, 'No winner at initial position');
});

// Test king movement
kingOfTheHillVariantTests.test('King can move to center for win', () => {
  const variant = new KingOfTheHillVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup king near center
  board[4][3] = 'K'; // White king at d5, one move from e5
  board[4][4] = null;
  
  // Check valid moves
  const validMoves = variant.getValidMoves(board, 4, 3, 'white');
  assert(validMoves.includes([4, 4]), 'King can move to center');
  
  // Apply move to center
  const result = variant.applyMove(board, [4, 3], [4, 4], 'K');
  assertEqual(result.board[4][4], 'K', 'King moved to center');
  
  // Check win condition
  const gameOverResult = variant.checkGameOver(result.board);
  assertEqual(gameOverResult, 'white', 'Win after moving king to center');
});

// Test kings not at center
kingOfTheHillVariantTests.test('Kings outside center can\'t win by capture', () => {
  const variant = new KingOfTheHillVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup kings outside center
  board[0][4] = 'K'; // White king
  board[7][4] = 'k'; // Black king
  board[3][4] = 'r'; // Black rook
  
  // Apply capture
  const result = variant.applyMove(board, [0, 4], [3, 4], 'K');
  
  // No winner from capture
  const gameOverResult = variant.checkGameOver(result.board);
  assertNull(gameOverResult, 'No winner from king capture outside center');
});

// Test check condition still applies
kingOfTheHillVariantTests.test('Check detection works normally', () => {
  const variant = new KingOfTheHillVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup check
  board[4][4] = 'K'; // White king
  board[6][4] = 'r'; // Black rook checking
  
  assertTrue(variant.isSquareAttacked(board, 4, 4, 'white'), 'Check detection works');
});

// Test that piece moves don't affect win condition
kingOfTheHillVariantTests.test('Game continues with normal piece moves', () => {
  const variant = new KingOfTheHillVariant();
  const board = variant.getInitialBoard();
  
  // Apply a normal pawn move
  const result = variant.applyMove(board, [6, 4], [4, 4], 'P');
  
  // Game should continue
  const gameOverResult = variant.checkGameOver(result.board);
  assertNull(gameOverResult, 'Game continues after pawn move');
});

// Test that variant preserves all standard rules
kingOfTheHillVariantTests.test('Standard chess rules still apply', () => {
  const variant = new KingOfTheHillVariant();
  const board = variant.getInitialBoard();
  
  // Test knight move (standard piece)
  assertTrue(variant.checkBasicMove(board, [7, 1], [5, 0], 'N'), 'Knight moves normally');
  
  // Test rook blocked
  assertFalse(variant.checkBasicMove(board, [7, 0], [5, 0], 'R'), 'Rook blocked by pawn');
  
  // Test pawn forward
  assertTrue(variant.checkBasicMove(board, [6, 4], [4, 4], 'P'), 'Pawn moves normally');
});

// Test multiple pieces at center
kingOfTheHillVariantTests.test('Multiple pieces can occupy center squares', () => {
  const variant = new KingOfTheHillVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup multiple pieces
  board[3][3] = 'K'; // White king at d4
  board[3][4] = 'r'; // Black rook at e4
  board[4][3] = 'N'; // White knight at d5
  board[4][4] = 'b'; // Black bishop at e5
  
  // Only king causes win
  const result = variant.checkGameOver(board);
  assertEqual(result, 'white', 'Only king counts for win');
});

// Test that center detection works for all four squares
kingOfTheHillVariantTests.test('All four center squares count for win', () => {
  const variant = new KingOfTheHillVariant();
  
  // Test each center square individually
  for (const [row, col] of [[3, 3], [3, 4], [4, 3], [4, 4]]) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[row][col] = 'K'; // White king
    
    const result = variant.checkGameOver(board);
    assertEqual(result, 'white', `King at [${row},${col}] should win`);
  }
});

// Test that non-king pieces don't trigger win
kingOfTheHillVariantTests.test('Non-king pieces don\'t trigger win', () => {
  const variant = new KingOfTheHillVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Non-king piece at center
  board[4][4] = 'Q'; // White queen at center
  
  const result = variant.checkGameOver(board);
  assertNull(result, 'Non-king piece doesn\'t trigger win');
});