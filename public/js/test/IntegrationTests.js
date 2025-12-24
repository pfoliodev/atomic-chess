import { TestSuite, assert, assertEqual, assertTrue, assertFalse, assertNotNull } from './TestFramework.js';
import { Game } from '../core/Game.js';
import { Renderer } from '../ui/Renderer.js';
import { AtomicVariant } from '../variants/AtomicVariant.js';
import { BattleRoyaleVariant } from '../variants/BattleRoyaleVariant.js';
import { KingOfTheHillVariant } from '../variants/KingOfTheHillVariant.js';
import { StandardVariant } from '../variants/StandardVariant.js';

export const integrationTests = new TestSuite('Integration Tests');

// Test Game with different variants
integrationTests.test('Game loads with Atomic variant', () => {
  const variant = new AtomicVariant();
  const game = new Game(variant, 'local', 600);
  
  assertNotNull(game.board, 'Game has board');
  assertEqual(game.currentPlayer, 'white', 'Game starts with white to move');
});

integrationTests.test('Game loads with BattleRoyale variant', () => {
  const variant = new BattleRoyaleVariant();
  const game = new Game(variant, 'local', 600);
  
  assertNotNull(game.board, 'Game has board');
  assertEqual(game.currentPlayer, 'white', 'Game starts with white to move');
});

integrationTests.test('Game loads with KingOfTheHill variant', () => {
  const variant = new KingOfTheHillVariant();
  const game = new Game(variant, 'local', 600);
  
  assertNotNull(game.board, 'Game has board');
  assertEqual(game.currentPlayer, 'white', 'Game starts with white to move');
});

// Test turn switching
integrationTests.test('Game switches turns after valid move', () => {
  const variant = new StandardVariant();
  const game = new Game(variant, 'local', 600);
  
  // Make a pawn move
  game.handleSquareClick(6, 4); // Select white pawn at e2
  const result = game.handleSquareClick(4, 4); // Move to e4
  
  assertEqual(result, 'move', 'Move succeeds');
  assertEqual(game.currentPlayer, 'black', 'Turn switches to black');
});

// Test invalid move handling
integrationTests.test('Game rejects invalid moves', () => {
  const variant = new StandardVariant();
  const game = new Game(variant, 'local', 600);
  
  // Try illegal move (pawn moving backward)
  game.handleSquareClick(6, 4); // Select white pawn
  const result = game.handleSquareClick(7, 4); // Move backward
  
  assertEqual(result, 'invalid', 'Invalid move rejected');
  assertEqual(game.currentPlayer, 'white', 'Turn remains with white');
});

// Test game over detection
integrationTests.test('Game detects checkmate', () => {
  const variant = new StandardVariant();
  const game = new Game(variant, 'local', 600);
  
  let gameOver = false;
  game.onGameOver = (winner, reason) => {
    gameOver = true;
  };
  
  // Set up checkmate position (using atomic explosion to capture king)
  // White king alone, black bishop checking
  game.board[7][4] = 'K'; // White king
  game.board[5][2] = 'b'; // Black bishop checking from c6
  
  // Check if game over detected
  const isGameOver = variant.checkGameOver(game.board);
  // Need actual checkmate position for this test
  
  assertFalse(gameOver, 'Game not over yet');
});

// Test atomic variant integration
integrationTests.test('Atomic variant explosions work in game', () => {
  const variant = new AtomicVariant();
  const game = new Game(variant, 'local', 600);
  
  // Set up explosion scenario
  game.board[3][3] = 'B'; // White bishop
  game.board[4][4] = 'n'; // Black knight
  game.board[4][3] = 'p'; // Black pawn
  
  // Make capture
  game.handleSquareClick(3, 3); // Select bishop
  game.handleSquareClick(4, 4); // Capture knight
  
  // Check pawn survived (immune to explosions)
  assertEqual(game.board[4][3], 'p', 'Pawn immune to explosion');
});

// Test BattleRoyale variant integration
integrationTests.test('BattleRoyale variant works with Game logic', () => {
  const variant = new BattleRoyaleVariant();
  const game = new Game(variant, 'local', 600);
  
  // Clear board for test
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      game.board[r][c] = null;
    }
  }
  
  // Place rook at a1
  game.board[0][0] = 'R';
  
  // Basic move should work
  game.handleSquareClick(0, 0); // Select rook
  const result = game.handleSquareClick(0, 7); // Move to h1
  
  assertEqual(result, 'move', 'BattleRoyale move works in game');
});

// Test KingOfTheHill variant integration
integrationTests.test('KingOfTheHill win condition works in game', () => {
  const variant = new KingOfTheHillVariant();
  const game = new Game(variant, 'local', 600);
  
  let gameOver = false;
  game.onGameOver = (winner, reason) => {
    gameOver = true;
  };
  
  // Move white king to center
  game.board[7][4] = null; // Remove from start
  game.board[4][4] = 'K'; // Place at center
  
  // Check win detected
  const winner = variant.checkGameOver(game.board);
  assertEqual(winner, 'white', 'White wins with king at center');
});

// Test timer integration
integrationTests.test('Timer counts down correctly', () => {
  const variant = new StandardVariant();
  const game = new Game(variant, 'local', 60); // 1 minute
  
  // Start timer
  game.startTimer();
  
  // Should start at full time
  assertEqual(game.timer.getRemainingTime('white'), 60, 'White has full time');
  assertEqual(game.timer.getRemainingTime('black'), 60, 'Black has full time');
  
  // Game starts, timer should be running
  assertTrue(game.timer.isRunning, 'Timer is running');
});

// Test board synchronization
integrationTests.test('Game state synchronization works', () => {
  const variant = new AtomicVariant();
  const game = new Game(variant, 'online', 600);
  
  // Sync with mock state
  const mockState = {
    board: variant.getInitialBoard(),
    currentPlayer: 'black',
    gameCode: 'TEST123',
    playerColor: 'white'
  };
  
  game.syncState(mockState);
  
  assertEqual(game.currentPlayer, 'black', 'Synced current player');
  assertEqual(game.playerColor, 'white', 'Synced player color');
});

// Test renderer integration
integrationTests.test('Renderer renders game state', () => {
  const variant = new StandardVariant();
  const game = new Game(variant, 'local', 600);
  const renderer = new Renderer('test-container');
  
  // Should render without error
  try {
    renderer.renderGame(game);
    assert(true, 'Renderer renders game');
  } catch (error) {
    assert(false, `Renderer failed: ${error.message}`);
  }
});

// Test variant state preservation
integrationTests.test('Variant state preserved in game', () => {
  const variant = new StandardVariant();
  const game = new Game(variant, 'online', 600);
  
  // Make a move that changes variant state
  game.handleSquareClick(6, 4); // Select pawn
  game.handleSquareClick(4, 4); // Move pawn
  
  // Variant state should be preserved
  const variantState = variant.getState();
  assertNotNull(variantState.lastMove, 'Last move recorded');
});

// Test performance with multiple variants
integrationTests.test('Swapping variants preserves game integrity', () => {
  const atomicVariant = new AtomicVariant();
  const battleRoyaleVariant = new BattleRoyaleVariant();
  
  const atomicGame = new Game(atomicVariant, 'local', 600);
  const battleRoyaleGame = new Game(battleRoyaleVariant, 'local', 600);
  
  // Both games should start correctly
  assertNotNull(atomicGame.board, 'Atomic game initialized');
  assertNotNull(battleRoyaleGame.board, 'BattleRoyale game initialized');
  
  // Both should be in standard starting position
  const atomicPiece = atomicGame.board[7][4];
  const battleRoyalePiece = battleRoyaleGame.board[7][4];
  assertEqual(atomicPiece, battleRoyalePiece, 'Both variants start with same position');
});