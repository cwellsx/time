import { WhatType } from "./whatType";

export type RequiredType = "required" | "optional";

export type Config = {
  // cached values from the Now page
  task?: string;
  tags?: string[];
  note?: string;
  // which tab is active on the What page
  whatType?: WhatType;
  // settings
  tagsRequired?: RequiredType;
  taskRequired?: RequiredType;
};
