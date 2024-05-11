import { useState } from "react";
import { GridEditor } from "./GridEditor"
import { solveScrabbleAsync, terminateWorker } from "./Solver";
import { AnswerViewer } from "./AnswerViewer";
import { normalize } from "./Chars";
import classes from "./Styles.module.css";

function App() {
  const [grid, setGrid] = useState([
    ["", "", ""],
    ["", "", ""],
  ]);
  const [wordsRaw, setWordsRaw] = useState("");
  const [maxAns, setMaxAns] = useState(10);

  const height = grid.length;
  const width = grid[0].length;

  const gridOnChange = (y: number, x: number, value: string) => {
    const newGrid = [];
    for (let i = 0; i < grid.length; ++i) {
      newGrid.push([...grid[i]]);
    }
    newGrid[y][x] = value;
    setGrid(newGrid);
  };

  const cropGrid = (topY: number, bottomY: number, leftX: number, rightX: number) => {
    const newGrid = [];
    for (let y = topY; y < bottomY; ++y) {
      const newRow = [];
      for (let x = leftX; x < rightX; ++x) {
        // check range
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
          newRow.push(grid[y][x]);
        } else {
          newRow.push("");
        }
      }
      newGrid.push(newRow);
    }
    setGrid(newGrid);
  };

  const onChangeHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value);
    if (newHeight >= 1) {
      cropGrid(0, newHeight, 0, width);
    }
  };

  const onChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value);
    if (newWidth >= 1) {
      cropGrid(0, height, 0, newWidth);
    }
  };

  const [isRunning, setIsRunning] = useState(false);

  const [answers, setAnswers] = useState<string[][][] | null>(null);
  const [status, setStatus] = useState("");

  const onRunSolver = async () => {
    const board = [];
    for (let y = 0; y < height; ++y) {
      const row = [];
      for (let x = 0; x < width; ++x) {
        if (grid[y][x] === "") {
          row.push(null);
        } else {
          row.push(grid[y][x]);
        }
      }
      board.push(row);
    }

    const words = wordsRaw.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

    setAnswers(null);
    setIsRunning(true);
    setStatus("Running");

    try {
      const start = Date.now();

      const results = await solveScrabbleAsync(board, words, maxAns);

      const elapsed = (Date.now() - start) / 1000.0;

      setAnswers(results);
      setIsRunning(false);

      if (results.length === 0) {
        setStatus(`Done (${elapsed}[s]); No answer`);
      } else {
        setStatus(`Done (${elapsed}[s])`);
      }
    } catch (e) {
      setIsRunning(false);
      setStatus(`Error: ${e}`);
    }
  };
  const onTerminateSolver = () => {
    if (!isRunning) {
      return;
    }
    terminateWorker();
  }

  const [isComposing, setIsComposing] = useState(false);

  const onWordsChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    if (isComposing) {
      setWordsRaw(e.currentTarget.value);
      return;
    }

    const normalized = normalize(e.currentTarget.value, {alphaUpperCase: true, noSmallKana: true});
    setWordsRaw(normalized);
  };

  const onCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    const normalized = normalize(e.currentTarget.value, {alphaUpperCase: true, noSmallKana: true});
    setWordsRaw(normalized);
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      onRunSolver();
      e.preventDefault();
    }
  }

  return (
    <div>
      <div>
        height: <input type="number" value={height} onChange={onChangeHeight} size={4} />
        width: <input type="number" value={width} onChange={onChangeWidth} size={4} />
        max ans: <input type="number" value={maxAns} size={5} onChange={(e) => setMaxAns(parseInt(e.target.value))} />

        <input type="button" value="Solve" onClick={onRunSolver} disabled={isRunning} />
        <input type="button" value="Stop" onClick={onTerminateSolver} disabled={!isRunning} />
      </div>
      <div style={{display: "flex"}}>
        <GridEditor values={grid} onChange={gridOnChange} />

        <textarea
          rows={8}
          cols={20}
          className={classes.words}
          onInput={onWordsChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={onCompositionEnd}
          onKeyDown={onKeyDown}
          value={wordsRaw}
        />
      </div>
      <div>
        {status}
      </div>
      {
        answers && answers.length > 0 && <AnswerViewer answers={answers} />
      }
    </div>
  )
}

export default App;
