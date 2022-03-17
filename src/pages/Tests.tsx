import React from "react";

import { Weeks } from "./weeks";

import type { TestResult } from "../model";
type TestProps = {
  results: TestResult[];
};

export const Tests: React.FunctionComponent<TestProps> = (props: TestProps) => {
  const results = props.results;
  return (
    <>
      <ul>
        {results.map((result, index) => {
          const ok = result.ok ? "✅" : "❌";
          const text = `${ok} ${result.msec} msec -- ${result.title}`;
          return <li key={index}>{text}</li>;
        })}
      </ul>
      <p>testDates: {testDates() ? "✅" : "❌"}</p>
    </>
  );
};

function assert(b: boolean) {
  if (!b) throw new Error("assertion failed");
}

function testDates(): boolean {
  const weeks = new Weeks();
  try {
    {
      const result = weeks.getWeek(new Date(2022, 0, 1));
      assert(result.year === 2021);
      assert(result.week === 52);
    }
    {
      const result = weeks.getWeek(new Date(2022, 0, 3));
      assert(result.year === 2022);
      assert(result.week === 1);
    }
    {
      const result = weeks.getWeek(new Date(2022, 11, 25));
      assert(result.year === 2022);
      assert(result.week === 51);
    }
    {
      const result = weeks.getWeek(new Date(2022, 11, 26));
      assert(result.year === 2022);
      assert(result.week === 52);
    }
    {
      const result = weeks.getWeek(new Date(2023, 0, 1));
      assert(result.year === 2022);
      assert(result.week === 52);
    }
    {
      const result = weeks.getWeek(new Date(2023, 0, 2));
      assert(result.year === 2023);
      assert(result.week === 1);
    }
    return true;
  } catch {
    return false;
  }
}
