import { useState } from "react";
import { GridEditor } from "./GridEditor"
import classes from "./Styles.module.css";

function App() {
  const [grid, setGrid] = useState([
    ["", "", ""],
    ["", "", ""],
  ]);

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

  return (
    <div>
      <div>
        height: <input type="number" value={height} onChange={onChangeHeight} size={4} />
        width: <input type="number" value={width} onChange={onChangeWidth} size={4} />
      </div>
      <div style={{display: "flex"}}>
        <GridEditor values={grid} onChange={gridOnChange} />

        <textarea rows={8} cols={20} className={classes.words} />
      </div>
    </div>
  )
}

export default App;
