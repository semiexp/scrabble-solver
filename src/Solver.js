import Worker from "./Worker?worker";

let worker = null;
let currentReject = null;

export function solveScrabbleAsync(board, words, numMaxAnswers) {
  if (worker === null) {
    worker = new Worker();
  }
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      currentReject = null;
      resolve(e.data);
    };
    worker.postMessage({ board, words, numMaxAnswers });
    currentReject = reject;
  });
}

export function terminateWorker() {
  if (worker === null) return;
  worker.terminate();
  worker = null;

  if (currentReject !== null) {
    const reject = currentReject;
    currentReject = null;
    reject("terminated");
  }
}
