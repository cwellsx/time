import { WhatType } from './whatType';

export type Config = {
  task?: string;
  tags?: string[];
  note?: string;
  whatType?: WhatType;
};
