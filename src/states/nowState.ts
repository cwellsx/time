import type { Config, TagCount, Time } from "../model";

export interface NowState {
  readonly last?: {
    type: "start" | "stop" | "next";
    when: number;
  };
  readonly config: Config;

  saveTime(time: Time): void;
  cancelLast(): void;

  saveComment(comment: string): void;

  getAllTags(): TagCount[];
  saveTags(tags: string[]): void;

  getAllTasks(): TagCount[];
  saveTask(task: string): void;

  hasTags(): boolean;
  hasTask(): boolean;
}
