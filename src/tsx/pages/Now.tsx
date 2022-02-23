import React from 'react';

type NowProps = {
  text: string;
};

export const Now: React.FunctionComponent<NowProps> = (props: NowProps) => {
  return <p>{props.text}</p>;
};
