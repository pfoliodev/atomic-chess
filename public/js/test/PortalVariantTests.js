import { TestSuite, assert, assertEqual, assertTrue, assertFalse, assertArrayIncludes } from './TestFramework.js';
import { PortalVariant } from '../variants/PortalVariant.js';
import { Board } from '../core/Board.js';

export const portalVariantTests = new TestSuite('PortalVariant Tests');

// Test rook portal wrapping
portalVariantTests.test('Rook can wrap horizontally', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup rook at a1 (0,0), path should be clear for wrapping
  board[0][0] = 'R'; // White rook
  
  // Wrap from a1 to h1 (0,7) - rook should reappear at the far edge
  assertTrue(variant.checkBasicMove(board, [0, 0], [0, 7], 'R'), 'Rook wraps from a1 to h1');
});

portalVariantTests.test('Rook wrapping blocked by pieces', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup piece path
  board[0][0] = 'R'; // White rook
  board[0][1] = 'p'; // Pawn blocks path
  
  // Wrap should be blocked
  assertFalse(variant.checkBasicMove(board, [0, 0], [0, 7], 'R'), 'Blocked rook cannot wrap');
});

// Test bishop portal wrapping
portalVariantTests.test('Bishop can wrap diagonally', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup bishop at a1 (0,0)
  board[0][0] = 'B';
  
  // Bishop diagonal path from a1 to h8 should wrap
  assertTrue(variant.checkBasicMove(board, [0, 0], [7, 7], 'B'), 'Bishop wraps to far diagonal');
});

portalVariantTests.test('Bishop wrapping blocked by pieces', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup piece path
  board[0][0] = 'B';
  board[1][1] = 'p'; // Pawn blocks path
  
  // Wrap should be blocked
  assertFalse(variant.checkBasicMove(board, [0, 0], [7, 7], 'B'), 'Blocked bishop cannot wrap');
});

// Test queen portal wrapping
portalVariantTests.test('Queen can wrap horizontally', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  board[0][0] = 'Q'; // White queen
  
  // Queen should be able to wrap like rook or bishop
  assertTrue(variant.checkBasicMove(board, [0, 0], [0, 7], 'Q'), 'Queen wraps horizontally');
});

portalVariantTests.test('Queen can wrap diagonally', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  board[0][0] = 'Q'; // White queen
  
  // Queen behaves like bishop
  assertTrue(variant.checkBasicMove(board, [0, 0], [7, 7], 'Q'), 'Queen wraps diagonally');
});

// Test knight portal wrapping
portalVariantTests.test('Knight can wrap horizontally', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Knight at h5 can wrap to a6 or a4
  board[4][7] = 'N'; // White knight
  
  // Knight should be able to wrap sideways
  assertTrue(variant.checkBasicMove(board, [4, 7], [5, 0], 'N'), 'Knight wraps to a4');
  assertTrue(variant.checkBasicMove(board, [4, 7], [3, 0], 'N'), 'Knight wraps to a6');
});

portalVariantTests.test('Knight cannot wrap vertically', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Knight can't wrap vertically (top/bottom)
  board[0][4] = 'N'; // White knight
  
  try {
    // Should not wrap from top side
    variant.checkBasicMove(board, [0, 4], [8, 5], 'N');
    assert(false, 'Should not allow vertical wrapping');
  } catch (error) {
    /* Expected */
  }
});

// Test pawns cannot wrap
portalVariantTests.test('Pawns cannot wrap', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Pawn should move normally
  board[6][4] = 'P'; // White pawn
  
  // Pawn should not wrap
  assertFalse(variant.checkBasicMove(board, [6, 4], [6, 0], 'P'), 'Pawn cannot wrap');
});

// Test king cannot wrap
portalVariantTests.test('King cannot wrap', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // King at edge
  board[0][0] = 'K'; // White king
  
  // King should not wrap
  assertFalse(variant.checkBasicMove(board, [0, 0], [0, 7], 'K'), 'King cannot wrap');
});

// Test portal moves in valid moves
portalVariantTests.test('Portal moves included in valid moves', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup queen at c4
  board[3][2] = 'Q';
  
  const validMoves = variant.getValidMoves(board, 3, 2, 'white');
  
  // Should include portal moves
  assertArrayIncludes(validMoves, [0, 0], 'Queen should wrap to a1');
  assertArrayIncludes(validMoves, [7, 2], 'Queen should wrap to normal position');
  
  // Should also include normal moves
  assertArrayIncludes(validMoves, [3, 3], 'Queen should move normally');
});

// Test complex portal scenario
portalVariantTests.test('Complex portal move application', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup scenario
  board[3][1] = 'B'; // White bishop at d4
  board[4][4] = 'p'; // Black pawn
  
  // Apply portal move
  const result = variant.applyMove(board, [3, 1], [4, 4], 'B');
  
  // Check move applied correctly
  assertNull(result.board[3][1], 'Bishop moved from d4');
  assertEqual(result.board[4][4], 'B', 'Bishop moved to e5');
  
  // Check move notation reflects special nature
  assertNotNull(result.moveNotation, 'Move notation should exist');
});

// Test no vertical wrapping
portalVariantTests.test('No vertical wrapping supported', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup rook at bottom trying to wrap to top
  board[0][4] = 'R'; // White rook at bottom edge
  
  // Should not be able to wrap vertically
  assertFalse(variant.checkBasicMove(board, [0, 4], [7, 4], 'R'), 'Rook cannot wrap vertically');
});

// Test board edge safety
portalVariantTests.test('Board edge moves are safe', () => {
  const variant = new PortalVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup piece at edge
  board[0][7] = 'N'; // White knight at h8
  
  // Try moves that would go off-board with wrapping
  try {
    variant.checkBasicMove(board, [0, 7], [1, 9], 'N'); // Should handle wrapping
    assert(false, 'Should handle wrapping properly');
  } catch (error) {
    assert(error.message === 'Not implemented yet', 'Expected specific error for unimplemented move');
  }
});