import type { Period } from "../model";

type FilterProps = {
  task: string | undefined;
  tag: string | undefined;
};

export type Total = {
  text: string;
  minutes: number;
};

export type Subtotals = {
  text: string;
  totals: Total[];
};

export type AllTotals = {
  totals: Total[];
  subtotals?: Subtotals[];
};

export function getAllTotals(periods: Period[], filter: FilterProps): AllTotals {
  let totals: Total[] = [{ text: "Total", minutes: 0 }];

  function addTotal(text: string, minutes: number): void {
    const found = totals.find((it) => it.text == text);
    if (found) found.minutes += minutes;
    else totals.push({ text, minutes });
  }

  for (const period of periods) {
    const minutes = (period.stop - period.start) / 60000;
    addTotal("Total", minutes);

    if (filter.task) {
      if (period.tags && period.tags.length) {
        addTotal(period.tags[0], minutes);
      }
    } else {
      if (period.task) {
        addTotal(period.task, minutes);
      }
    }
  }

  if (filter.task) sortTags(totals);

  pushRemainder(totals);

  return { totals };
}

function pushRemainder(totals: Total[]): void {
  if (totals.length === 1) return;
  const subtotal = totals
    .slice(1)
    .map((it) => it.minutes)
    .reduce((x, y) => x + y, 0);
  const total = totals[0].minutes;
  if (subtotal < total) totals.push({ text: "[other]", minutes: total - subtotal });
}

const sortedTags = ["Total", "investigation", "meeting", "coding", "testing", "test-setup", "pr"];

function sortTags(totals: Total[]): void {
  totals.sort((x, y) => {
    let x1 = sortedTags.indexOf(x.text);
    let y1 = sortedTags.indexOf(y.text);
    if (x1 === -1) return y1 === -1 ? x.text.localeCompare(y.text) : 1;
    else return y1 === -1 ? -1 : x1 - y1;
  });
}
