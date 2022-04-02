import type { Config, TagCount } from "../model";

export type EditWhatState = {
  readonly config: Config;
  getAllTags(): TagCount[];
  getAllTasks(): TagCount[];
};
