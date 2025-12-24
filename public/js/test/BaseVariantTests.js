import { TestSuite, assert, assertEqual, assertTrue } from './TestFramework.js';
import { BaseVariant } from '../variants/BaseVariant.js';
import { Board } from '../core/Board.js';

export const baseVariantTests = new TestSuite('BaseVariant Tests');

// Test getInitialBoard
baseVariantTests.test('getInitialBoard returns standard chess starting position', () => {
  const variant = new BaseVariant();
  const board = variant.getInitialBoard();
  
  // Check back ranks
  assertEqual(board[0][0], 'r', 'Black rook in corner');
  assertEqual(board[0][4], 'k', 'Black king in center');
  assertEqual(board[7][0], 'R', 'White rook in corner');
  assertEqual(board[7][4], 'K', 'White king in center');
  
  // Check pawns
  for (let i = 0; i < 8; i++) {
    assertEqual(board[1][i], 'p', `Black pawn at position 1,${i}`);
    assertEqual(board[6][i], 'P', `White pawn at position 6,${i}`);
  }
  
  // Check empty squares
  for (let r = 2; r <= 5; r++) {
    for (let c = 0; c < 8; c++) {
      assert(board[r][c] === null, `Square ${r},${c} should be empty`);
    }
  }
});

// Test pawn movement
baseVariantTests.test('Pawn moves correctly', () => {
  const variant = new BaseVariant();
  const board = variant.getInitialBoard();
  
  // White pawn forward
  assertTrue(variant.checkBasicMove(board, [6, 4], [4, 4], 'P'), 'White pawn 2 squares forward');
  assertTrue(variant.checkBasicMove(board, [6, 4], [5, 4], 'P'), 'White pawn 1 square forward');
  
  // White pawn attack
  assertTrue(variant.checkBasicMove(board, [6, 4], [5, 5], 'P'), 'White pawn diagonal capture');
  
  // Black pawn
  assertTrue(variant.checkBasicMove(board, [1, 4], [3, 4], 'p'), 'Black pawn 2 squares forward');
});

// Test knight movement
baseVariantTests.test('Knight moves in L-shape', () => {
  const variant = new BaseVariant();
  const board = variant.getInitialBoard();
  const knight = 'N'; // White knight
  
  // Starting position knight moves
  assertTrue(variant.checkBasicMove(board, [7, 1], [5, 0], knight), 'Knight to left-up');
  assertTrue(variant.checkBasicMove(board, [7, 1], [5, 2], knight), 'Knight to right-up');
  assertFalse(variant.checkBasicMove(board, [7, 1], [7, 2], knight), 'Knight cannot move like rook');
});

// Test bishop movement
baseVariantTests.test('Bishop moves diagonally', () => {
  const variant = new BaseVariant();
  // Empty board for testing
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[0][0] = 'b'; // Black bishop
  
  assertTrue(variant.checkBasicMove(board, [0, 0], [3, 3], 'b'), 'Bishop down-right');
  assertTrue(variant.checkBasicMove(board, [0, 0], [7, 7], 'b'), 'Bishop far down-right');
  assertFalse(variant.checkBasicMove(board, [0, 0], [0, 5], 'b'), 'Bishop cannot move horizontally');
});

// Test rook movement
baseVariantTests.test('Rook moves horizontally/vertically', () => {
  const variant = new BaseVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = 'R'; // White rook
  
  assertTrue(variant.checkBasicMove(board, [4, 4], [4, 7], 'R'), 'Rook horizontal');
  assertTrue(variant.checkBasicMove(board, [4, 4], [0, 4], 'R'), 'Rook vertical');
  assertFalse(variant.checkBasicMove(board, [4, 4], [6, 6], 'R'), 'Rook cannot move diagonally');
});

// Test isSquareAttacked
baseVariantTests.test('isSquareAttacked correctly detects attacks', () => {
  const variant = new BaseVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = 'K'; // White king
  board[2][3] = 'b'; // Black bishop
  
  assertTrue(variant.isSquareAttacked(board, 4, 4, 'white'), 'King attacked by bishop');
  assertFalse(variant.isSquareAttacked(board, 0, 0, 'white'), 'Empty square not attacked');
});

// Test checkGameOver
baseVariantTests.test('checkGameOver returns null when kings exist', () => {
  const variant = new BaseVariant();
  const board = variant.getInitialBoard();
  
  assert(variant.checkGameOver(board) === null, 'Game not over initially');
});

baseVariantTests.test('checkGameOver returns correct winner when king captured', () => {
  const variant = new BaseVariant();
  const board = variant.getInitialBoard();
  board[0][4] = null; // Remove black king
  
  assertEqual(variant.checkGameOver(board), 'white', 'White wins when black king captured');
});

// Test castling
baseVariantTests.test('Castling flags work correctly', () => {
  const baseBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  baseBoard[7][4] = 'K';
  baseBoard[7][0] = 'R';
  baseBoard[7][7] = 'R';
  
  const variant = new BaseVariant();
  
  // Should be able to castle
  assertTrue(variant.canCastle(baseBoard, 'white', 'kingside'), 'Can castle kingside initially');
  assertTrue(variant.canCastle(baseBoard, 'white', 'queenside'), 'Can castle queenside initially');
  
  // After king moves
  variant.kingMoved.white = true;
  assertFalse(variant.canCastle(baseBoard, 'white', 'kingside'), 'Cannot castle after king moves');
  assertFalse(variant.canCastle(baseBoard, 'white', 'queenside'), 'Cannot castle after king moves');
});

// Test en passant capture
baseVariantTests.test('En passant detection works', () => {
  const variant = new BaseVariant();
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set up en passant scenario
  variant.lastMove = { from: [1, 4], to: [3, 4], piece: 'p' };
  board[4][4] = 'P'; // White pawn
  board[3][4] = 'p'; // Black pawn just moved 2 squares
  
  // Should detect en passant
  assertTrue(variant.canCaptureEnPassant(board, [4, 4], [3, 5]), 'Can capture en passant');
});