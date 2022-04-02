import React from 'react';

import { Action, Assert, initialState, reducer, RenderedState, TagDictionary, Validation } from './selectTagsState';

import type { TagCount } from "./tagsTypes";

export function useSelectTags(
  inputTags: string[],
  allTags: TagCount[],
  validation: Validation
): {
  state: RenderedState;
  dispatch: React.Dispatch<Action>;
  tagDictionary: TagDictionary;
  assert: Assert;
  errorMessage: string | undefined;
} {
  // this is an optional error message
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  function assert(assertion: boolean, message: string, extra?: () => object): void {
    if (!assertion) {
      if (extra) {
        const o: object = extra();
        const json = JSON.stringify(o, null, 2);
        message = `${message} -- ${json}`;
      }
      // write to errorMessage state means it's displayed by the `<ErrorMessage errorMessage={errorMessage} />` element
      setTimeout(() => {
        // do it after a timeout because otherwise if we do this during a render then React will complain with:
        //   "Too many re-renders. React limits the number of renders to prevent an infinite loop."
        setErrorMessage(message);
      }, 0);
      console.error(message);
    }
  }

  // this is a dictionary of existing tags
  const tagDictionary: TagDictionary = new TagDictionary(allTags);

  // see ./EDITOR.md and the definition of the RenderedState interface for a description of this state
  // also https://fettblog.eu/typescript-react/hooks/#usereducer says that type is infered from signature of reducer
  const [state, dispatch] = React.useReducer(reducer, inputTags, (inputTags) =>
    initialState(assert, inputTags, validation, tagDictionary)
  );

  /*
    Event handlers
  */

  return { state, dispatch, tagDictionary, assert, errorMessage };
}
