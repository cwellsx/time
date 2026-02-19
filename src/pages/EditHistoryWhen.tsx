import React from "react";
import { Period } from "../model";
import { EditWhen, WhenIsValid } from "./EditWhen";
import { getPeriodsEquals } from "./helpEditWhen";

type EditHistoryWhenProps = {
  min: number | undefined;
  max: number | undefined;
  period: Period;
  onSave: (when: Period) => void;
};

export const EditHistoryWhen: React.FunctionComponent<EditHistoryWhenProps> = (props: EditHistoryWhenProps) => {
  const { period, min, max } = props;

  const [whenIsValid, setWhenIsValid] = React.useState<WhenIsValid>({ when: period, isValid: true });

  function onSave(event: React.MouseEvent<HTMLButtonElement>): void {
    if (!whenIsValid.isValid) {
      return;
    }
    props.onSave(whenIsValid.when);
  }

  const { isModified } = getPeriodsEquals(period, whenIsValid.when);

  const saveButton = !whenIsValid.isValid || !isModified ? undefined : <button onClick={onSave}>Save</button>;
  return (
    <>
      <div className="table close">
        <EditWhen period={period} min={min} max={max} parentCallback={setWhenIsValid} />
      </div>
      {saveButton}
    </>
  );
};
