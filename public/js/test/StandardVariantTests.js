import { TestSuite, assert, assertEqual, assertTrue, assertFalse, assertNull } from './TestFramework.js';
import { StandardVariant } from '../variants/StandardVariant.js';
import { Board } from '../core/Board.js';

export const standardVariantTests = new TestSuite('StandardVariant Tests');

// Test that standard variant has no special rules
standardVariantTests.test('Standard variant inherits all BaseVariant functionality', () => {
  const variant = new StandardVariant();
  const board = variant.getInitialBoard();
  
  // Test standard starting position
  assertEqual(board[6][4], 'P', 'White pawn at e2');
  assertEqual(board[1][4], 'p', 'Black pawn at e7');
});

standardVariantTests.test('Standard variant has normal pawn moves', () => {
  const variant = new StandardVariant();
  const board = variant.getInitialBoard();
  
  // Test 1 square move
  assertTrue(variant.checkBasicMove(board, [6, 4], [5, 4], 'P'), 'Pawn 1 square');
  
  // Test 2 square move from start
  assertTrue(variant.checkBasicMove(board, [6, 4], [4, 4], 'P'), 'Pawn 2 squares from start');
  
  // Test diagonal capture
  assertTrue(variant.checkBasicMove(board, [6, 4], [5, 5], 'P'), 'Pawn diagonal capture');
});

standardVariantTests.test('Standard variant castling works', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[7][4] = 'K';
  board[7][0] = 'R';
  board[7][7] = 'R';
  
  const variant = new StandardVariant();
  
  assertTrue(variant.canCastle(board, 'white', 'kingside'), 'Kingside castling available');
  assertTrue(variant.canCastle(board, 'white', 'queenside'), 'Queenside castling available');
});

standardVariantTests.test('Standard variant en passant works', () => {
  const variant = new StandardVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup en passant
  variant.lastMove = { from: [1, 4], to: [3, 4], piece: 'p' };
  board[4][4] = 'P'; // White pawn
  board[3][4] = 'p'; // Black pawn just moved
  
  assertTrue(variant.canCaptureEnPassant(board, [4, 4], [3, 5]), 'En passant available');
});

standardVariantTests.test('Standard variant game over with missing king', () => {
  const variant = new StandardVariant();
  const board = variant.getInitialBoard();
  board[0][4] = null; // Remove black king
  
  assertEqual(variant.checkGameOver(board), 'white', 'White wins when black king captured');
});

standardVariantTests.test('Standard variant has no special mechanics', () => {
  const variant = new StandardVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup
  board[3][3] = 'B'; // White bishop
  board[4][4] = 'n'; // Black knight
  
  // Apply move
  const result = variant.applyMove(board, [3, 3], [4, 4], 'B');
  
  // Standard variant should have no explosions
  assertEqual(result.explosionSquares.length, 0, 'No explosions in standard variant');
  
  // Should have standard notation
  assert(result.moveNotation.includes('B'), 'Standard notation');
});

standardVariantTests.test('Standard variant valid moves are correct', () => {
  const variant = new StandardVariant();
  const board = variant.getInitialBoard();
  
  // White pawn at e2 has 2 moves
  const validMoves = variant.getValidMoves(board, 6, 4, 'white');
  
  assert(validMoves.length === 2, 'White pawn has 2 valid moves');
  assert(validMoves.some(m => m[0] === 5 && m[1] === 4), 'Can move 1 square');
  assert(validMoves.some(m => m[0] === 4 && m[1] === 4), 'Can move 2 squares');
});

standardVariantTests.test('Standard variant preserves king safety', () => {
  const variant = new StandardVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup: white king in check
  board[4][4] = 'K'; // White king
  board[4][7] = 'r'; // Black rook attacking
  
  // King cannot move into check
  assertFalse(variant.isMoveSafe(board, [4, 4], [4, 5], 'K'), 'King cannot move into check');
});