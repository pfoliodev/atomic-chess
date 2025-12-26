
function testLogic(fen) {
    const parts = fen.split(' ');
    const board = parts[0];
    const turn = parts[1];
    const fullMove = parseInt(parts[5]);

    console.log(`Testing FEN: ${fen}`);
    console.log(`Turn: ${turn}, FullMove: ${fullMove}`);

    if (turn === 'b') {
        const rows = board.split('/');
        const row1 = rows[1];
        console.log(`Row 1: ${row1}`);

        let col = 0;
        let hasPawnE7 = false;
        for (let char of row1) {
            if (isNaN(char)) { // Pièce
                console.log(`  Col ${col}: Found piece ${char}`);
                if (col === 4 && char === 'p') hasPawnE7 = true;
                col++;
            } else { // Chiffre
                const skip = parseInt(char);
                console.log(`  Col ${col}: Found skip ${skip}`);
                col += skip;
            }
        }
        console.log(`Has Pawn E7: ${hasPawnE7}`);

        if (fullMove === 1 && hasPawnE7) console.log('Recommendation: e7e5');
        else console.log('No recommendation');
    }
}

// Case standard after 1. e4
testLogic('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');

// Case empty e7 (e.g. captured)
testLogic('rnbqkbnr/pppp1ppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
