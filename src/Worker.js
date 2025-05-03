import Module from "./solver/scrabble_solver";

let Solver = null;

function solveScrabble(board, words, allShown, numMaxAnswers) {
  const height = board.length;
  const width = board[0].length;

  if (!(height <= 255 && width <= 255)) {
      throw new Error("Board is too large");
  }

  const buffer = [];
  buffer.push(height);
  buffer.push(width);

  const charToIndex = new Map();
  const charSet = [];

  const charId = function (c) {
      if (!charToIndex.has(c)) {
          charToIndex.set(c, charToIndex.size);
          charSet.push(c);
      }
      return charToIndex.get(c);
  };

  for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
          let v = -1;
          if (board[y][x] === null) {
              v = 0;
          } else if (board[y][x] === " ") {
              v = 1;
          } else {
              v = charId(board[y][x]) + 2;
          }
          buffer.push(v & 0xff);
          buffer.push((v >> 8) & 0xff);
      }
  }

  const numWords = words.length;
  buffer.push(numWords & 0xff);
  buffer.push((numWords >> 8) & 0xff);

  for (let i = 0; i < numWords; ++i) {
      const word = words[i];
      const length = word.length;

      if (!(length <= 255)) {
          throw new Error("Word is too long");
      }
      buffer.push(length);
      for (let j = 0; j < length; ++j) {
          const c = charId(word[j]);
          buffer.push(c & 0xff);
          buffer.push((c >> 8) & 0xff);
      }
  }

  const solverBuf = Solver._malloc(buffer.length);
  Solver.HEAPU8.set(buffer, solverBuf);

  const result = Solver._solve_scrabble(solverBuf, buffer.length, numMaxAnswers, allShown ? 1 : 0);
  Solver._free(solverBuf);

  const numAnswers = Solver.HEAPU8[result] | (Solver.HEAPU8[result + 1] << 8) | (Solver.HEAPU8[result + 2] << 16) | (Solver.HEAPU8[result + 3] << 24);

  const answers = [];
  for (let i = 0; i < numAnswers; ++i) {
      const answer = [];
      for (let y = 0; y < height; ++y) {
          const row = [];
          for (let x = 0; x < width; ++x) {
              const ofs = result + 4 + i * height * width * 2 + y * width * 2 + x * 2;
              const c = Solver.HEAPU8[ofs] | (Solver.HEAPU8[ofs + 1] << 8);
              if (c === 0) {
                  row.push(" ");
              } else {
                  row.push(charSet[c - 1]);
              }
          }
          answer.push(row);
      }
      answers.push(answer);
  }

  self.postMessage(answers);
}

self.onmessage = function (e) {
  const data = e.data;

  if (Solver) {
    solveScrabble(data.board, data.words, data.allShown, data.numMaxAnswers);
  } else {
    Module().then(mod => {
      Solver = mod;
      solveScrabble(data.board, data.words, data.allShown, data.numMaxAnswers);
    })
  }
}

Module().then(mod => {
  Solver = mod;
});

