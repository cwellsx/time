import React from 'react';

import { NowState } from '../ts_data';

type NowProps = {
  text: string;
  state: NowState;
};

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  return (
    <React.Fragment>
      <p>{props.text}</p>
    </React.Fragment>
  );
};
