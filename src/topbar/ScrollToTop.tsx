import React from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const ScrollToTop: React.FunctionComponent = (props) => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  React.useEffect(() => {
    if (navigationType !== "POP") {
      console.log("ScrollToTop");
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
};
