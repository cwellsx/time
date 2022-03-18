import React from "react";

import { useSetTesting, useTesting } from "../appContext";
import { aggregate } from "./sums";
import { Weeks } from "./weeks";

import type { Period, TestResults } from "../model";

type TestProps = {
  testResults: TestResults;
};

export const Tests: React.FunctionComponent<TestProps> = (props: TestProps) => {
  const { results, periods } = props.testResults;
  const testing = useTesting();
  const setTesting = useSetTesting();
  const handleChange = () => {
    setTesting(!testing);
  };
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
      <p>testSums: {testSums(periods) ? "✅" : "❌"}</p>
      <p>
        <label>
          <input type="checkbox" checked={testing} onChange={handleChange} /> Display the test database
        </label>
      </p>
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
      const result = weeks.getWeekId(new Date(2022, 0, 1));
      assert(result.year === 2021);
      assert(result.week === 52);
    }
    {
      const result = weeks.getWeekId(new Date(2022, 0, 3));
      assert(result.year === 2022);
      assert(result.week === 1);
    }
    {
      const result = weeks.getWeekId(new Date(2022, 11, 25));
      assert(result.year === 2022);
      assert(result.week === 51);
    }
    {
      const result = weeks.getWeekId(new Date(2022, 11, 26));
      assert(result.year === 2022);
      assert(result.week === 52);
    }
    {
      const result = weeks.getWeekId(new Date(2023, 0, 1));
      assert(result.year === 2022);
      assert(result.week === 52);
    }
    {
      const result = weeks.getWeekId(new Date(2023, 0, 2));
      assert(result.year === 2023);
      assert(result.week === 1);
    }
    return true;
  } catch {
    return false;
  }
}

function testSums(periods: Period[]): boolean {
  const result = aggregate(periods);
  return true;
}
