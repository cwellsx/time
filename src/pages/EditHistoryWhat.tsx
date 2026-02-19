import React from "react";
import { What } from "../model";
import { EditWhatState } from "../states";
import { EditWhat, WhatIsValid } from "./EditWhat";

type EditHistoryWhatProps = {
  state: EditWhatState;
  what: What;
  onSave: (what: What) => void;
};

function whatsEqual(x: What, y: What): boolean {
  const tagsEquals = !x.tags
    ? !y.tags
    : x.tags.length === y.tags?.length && x.tags.every((it, index) => (it = y.tags![index]));
  return x.note === y.note && x.task === y.task && tagsEquals;
}

export const EditHistoryWhat: React.FunctionComponent<EditHistoryWhatProps> = (props: EditHistoryWhatProps) => {
  const { state, what } = props;

  // unlike Now.tsx this is useState instead of userRef because on edit callback we want to re-render the Save button
  const [whatIsValid, setWhatIsValid] = React.useState<WhatIsValid>({ what, isValid: true });
  const [showValidationError, setShowValidationError] = React.useState<boolean>(false);

  function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
    if (!whatIsValid.isValid) {
      setShowValidationError(true);
      return;
    }
    props.onSave(whatIsValid.what);
  }

  const saveButton = whatsEqual(what, whatIsValid.what) ? undefined : <button onClick={onSave}>Save</button>;
  return (
    <>
      <div className="table">
        <EditWhat state={state} showValidationError={showValidationError} what={what} parentCallback={setWhatIsValid} />
      </div>
      {saveButton}
    </>
  );
};
