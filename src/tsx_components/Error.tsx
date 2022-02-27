import React from 'react';

type ErrorProps = {
  error: string;
};

export const Error: React.FunctionComponent<ErrorProps> = (props: ErrorProps) => {
  const error = props.error;
  return error ? <div className="error">{error}</div> : <React.Fragment />;
};
