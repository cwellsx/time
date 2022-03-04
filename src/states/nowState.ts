import type { Config, TagCount, Time } from "../model";

export interface NowState {
  readonly last?: {
    type: "start" | "stop" | "next";
    when: number;
  };
  readonly config: Config;
  saveTime(time: Time): void;
  saveComment(comment: string): void;
  getAllTags(): Promise<TagCount[]>;
  saveTags(tags: string[]): void;
}
