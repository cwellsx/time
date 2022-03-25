import type { Config, TagCount, Time } from "../model";

export interface NowState {
  readonly last: Time | undefined;
  readonly config: Config;

  saveTime(time: Time): void;
  cancelLast(): void;

  saveComment(comment: string | undefined): void;
  saveTags(tags: string[] | undefined): void;
  saveTask(task: string | undefined): void;

  getAllTags(): TagCount[];
  getAllTasks(): TagCount[];
}
