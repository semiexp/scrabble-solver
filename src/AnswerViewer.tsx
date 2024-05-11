import { useEffect, useState } from "react";
import classes from "./Styles.module.css";

type AnswerViewerProps = {
  answers: string[][][];
};

export const AnswerViewer = (props: AnswerViewerProps) => {
  const answers = props.answers;

  const [answerIdx, setAnswerIdx] = useState(0);

  useEffect(() => {
    setAnswerIdx(0);
  }, [answers]);

  if (answers.length === 0) {
    return <span>no answer</span>;
  }

  const answer = answers[answerIdx];
  const height = answer.length;
  const width = answer[0].length;

  const rows = [];
  for (let y = 0; y < height; ++y) {
    const row = [];
    for (let x = 0; x < width; ++x) {
      row.push(<div key={`${y}-${x}`} className={classes.answerCell}>{answer[y][x]}</div>);
    }
    rows.push(<div key={`${y}`} style={{display: "flex"}}>{row}</div>);
  }

  return (<div>
    <div>
      <button onClick={() => setAnswerIdx((answerIdx - 1 + answers.length) % answers.length)}>{"<"}</button>
      <span>{`${answerIdx + 1} / ${answers.length}`}</span>
      <button onClick={() => setAnswerIdx((answerIdx + 1) % answers.length)}>{">"}</button>
    </div>
    <div>{rows}</div>
  </div>);
};
