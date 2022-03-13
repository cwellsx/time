// import { TagsRange } from "./range";

// as well as the key which identifies a tag, this has a count of how often it's used, and its summary of how to use it
export interface TagCount extends Key {
  summary?: string;
  count: number;
}

// export interface Tags {
//   range: TagsRange;
//   tagCounts: TagCount[];
// }

export interface TagInfo extends Key {
  summary?: string;
  markdown?: string;
}

export const tagSummaryLength = { min: 20, max: 460 };

// the results are pushed back to the parent via this callback
export interface OutputTags {
  tags: string[];
  isValid: boolean;
}
export type ParentCallback = (outputTags: OutputTags) => void;

/*
  Most things -- e.g. users and discussions -- are identified (to the system) by a numeric Id, and (to users) by a name.

  Messages (within a discussion) are identified by a numeric Id but no name
  (though they have other properties too e.g. author and date).

  Tags are identified -- to the system and to users -- by a readable key string without a numeric Id.
*/

export interface IdName {
  id: number;
  name: string;
}

export interface Key {
  key: string;
}
