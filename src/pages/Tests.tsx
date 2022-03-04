import React from 'react';

import type { TestResult } from "../model";

type TestProps = {
  results: TestResult[];
};

export const Tests: React.FunctionComponent<TestProps> = (props: TestProps) => {
  const results = props.results;
  return (
    <ul>
      {results.map((result, index) => {
        const ok = result.ok ? "✅" : "❌";
        const text = `${ok} ${result.msec} msec -- ${result.title}`;
        return <li key={index}>{text}</li>;
      })}
    </ul>
  );
};
