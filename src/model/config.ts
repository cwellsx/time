import type { What } from "./what";
import type { WhatType } from "./whatType";

export type RequiredType = "required" | "optional";

// the What properties are cached values from the Now page
export type Config = What & {
  // which tab is active on the What page
  whatType?: WhatType;
  // settings
  tagsRequired?: RequiredType;
  taskRequired?: RequiredType;
  historyEditable?: boolean;
  // year
  year?: string;
};
