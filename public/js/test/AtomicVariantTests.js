import { TestSuite, assert, assertEqual, assertTrue, assertFalse } from './TestFramework.js';
import { AtomicVariant } from '../variants/AtomicVariant.js';
import { Board } from '../core/Board.js';

export const atomicVariantTests = new TestSuite('AtomicVariant Tests');

// Test atomic explosion
atomicVariantTests.test('Atomic explosion destroys adjacent pieces', () => {
  const variant = new AtomicVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup: white bishop at d4, black knight at e5
  board[3][3] = 'B'; // White bishop at d4
  board[4][4] = 'n'; // Black knight at e4
  
  // Surround with pieces that should be destroyed
  board[3][4] = 'r'; // Black rook
  board[4][3] = 'b'; // Black bishop
  board[3][3] = 'B'; // White bishop (capturing)
  
  // Apply the move (capture)
  const result = variant.applyMove(board, [3, 3], [4, 4], 'B');
  
  // Check explosion occured
  assertTrue(result.explosionSquares.length > 0, 'Explosion happened');
  
  // Check that captured piece is gone
  assertNull(result.board[4][4], 'Captured piece removed');
  
  // Check adjacent pieces destroyed
  assertNull(result.board[3][4], 'Adjacent rook destroyed');
  assertNull(result.board[4][3], 'Adjacent bishop destroyed');
});

atomicVariantTests.test('Pawns are immune to atomic explosions', () => {
  const variant = new AtomicVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup: bishop captures knight, pawn nearby
  board[3][3] = 'B'; // White bishop
  board[4][4] = 'n'; // Black knight
  board[4][3] = 'p'; // Black pawn (should survive)
  
  const result = variant.applyMove(board, [3, 3], [4, 4], 'B');
  
  // Pawn should still be there
  assertEqual(result.board[4][3], 'p', 'Pawn immune to explosion');
});

atomicVariantTests.test('Explosion destroys 3x3 area around capture', () => {
  const variant = new AtomicVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup explosion at center (d4)
  board[3][3] = 'B'; // White bishop
  board[4][4] = 'n'; // Black knight (center of explosion)
  
  // Fill 3x3 area with pieces
  for (let r = 3; r <= 5; r++) {
    for (let c = 3; c <= 5; c++) {
      if (r !== 3 || c !== 3) { // Don't overwrite bishop
        board[r][c] = board[r][c] || 'r';
      }
    }
  }
  
  const result = variant.applyMove(board, [3, 3], [4, 4], 'B');
  
  // Check all 3x3 area (except king/pawns) is cleared
  let clearedCount = 0;
  for (let r = 3; r <= 5; r++) {
    for (let c = 3; c <= 5; c++) {
      if (result.board[r][c] === null && (r !== 4 || c !== 4)) {
        clearedCount++;
      }
    }
  }
  
  assert(clearedCount > 0, 'Pieces in explosion area cleared');
});

atomicVariantTests.test('Capturing own king removes king from board', () => {
  const variant = new AtomicVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup: if somehow white bishop captures own king (illegal but tests gameOver)
  board[4][3] = 'b'; // Black bishop
  board[4][4] = 'K'; // White king (captured - shouldn't normally happen)
  board[3][3] = null;
  
  const result = variant.applyMove(board, [4, 3], [4, 4], 'b');
  
  // Check king is gone
  assertNull(result.board[4][4], 'King removed from board after capture');
});

atomicVariantTests.test('Game ends when king captured in atomic', () => {
  const variant = new AtomicVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup
  board[3][3] = 'B'; // White bishop
  board[4][4] = 'k'; // Black king
  
  const result = variant.applyMove(board, [3, 3], [4, 4], 'B');
  
  // Check gameOver
  const gameOverResult = variant.checkGameOver(result.board);
  assertEqual(gameOverResult, 'white', 'White wins when black king captured');
});

atomicVariantTests.test('Explosion at board edge does not cause error', () => {
  const variant = new AtomicVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup explosion at corner
  board[0][0] = 'B'; // White bishop at corner
  board[1][1] = 'n'; // Black knight
  board[0][1] = 'r'; // Black rook
  board[1][0] = 'b'; // Black bishop
  
  // Should not throw
  try {
    const result = variant.applyMove(board, [0, 0], [1, 1], 'B');
    assert(result !== null, 'Move succeeded at board edge');
  } catch (error) {
    assert(false, `Should not throw error at board edge: ${error.message}`);
  }
});