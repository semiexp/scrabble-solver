import React, { useRef, useState } from "react";
import classes from "./Styles.module.css";

export type GridEditorProps = {
  values: string[][];
  onChange: (y: number, x: number, value: string) => void;
};

export const GridEditor = (props: GridEditorProps) => {
  const values = props.values;

  const height = values.length;
  const width = values[0].length;

  const rows = [];
  const refs: React.RefObject<{[key in string]: HTMLInputElement | null}> = useRef({});
  const [currentFocus, setCurrentFocus] = useState<{y: number, x: number} | null>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // if up arrow key is pressed
    if (currentFocus) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }

      const {y, x} = currentFocus;
      if (e.key === "ArrowDown" && y < height - 1) {
        refs.current![`${y + 1}-${x}`]!.focus();
      }
      if (e.key === "ArrowRight" && x < width - 1) {
        refs.current![`${y}-${x + 1}`]!.focus();
      }
      if (e.key === "ArrowLeft" && x > 0) {
        refs.current![`${y}-${x - 1}`]!.focus();
      }
      if (e.key === "ArrowUp" && y > 0) {
        refs.current![`${y - 1}-${x}`]!.focus();
      }
    }
  };

  const onFocus = (y: number, x: number) => {
    // move the cursor to the end of the input
    refs.current![`${y}-${x}`]!.setSelectionRange(values[y][x].length, values[y][x].length);
    setCurrentFocus({y, x});
  };

  const [isComposing, setIsComposing] = useState(false);

  const onInput = (e: React.FormEvent<HTMLInputElement>, y: number, x: number) => {
    if (isComposing) {
      props.onChange(y, x, e.currentTarget.value);
      return;
    }

    let value = e.currentTarget.value;

    if (value.length >= 2) {
      value = value.substring(value.length - 1);
    }
    if (value === " ") {
      value = "";
    }
    value = value.toUpperCase();
    props.onChange(y, x, value);
  };

  for (let y = 0; y < height; ++y) {
    const row = [];
    for (let x = 0; x < width; ++x) {
      const value = values[y][x];
      row.push(
        <input
          key={`cell-${y}-${x}`}
          type="text"
          value={value}
          className={classes.gridEditorCell}
          ref={ref => refs.current![`${y}-${x}`] = ref}
          onFocus={() => onFocus(y, x)}
          onBlur={() => setCurrentFocus(null)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onInput={(e) => onInput(e, y, x)}
        />
      );
    }

    rows.push(<div key={`row-${y}`}>{row}</div>);
  }

  return <div>{rows}</div>;
};
