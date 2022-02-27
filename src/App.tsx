import React from 'react';
import * as ReactRouter from 'react-router-dom';

import { AppContext, useController, useError, useTestResults } from './ts_hooks';
import * as Component from './tsx_components';
import * as Page from './tsx_pages';

//import './App.css';
const App: React.FunctionComponent = () => {
  const [error, setError] = useError();
  return (
    <AppContext.Provider value={{ setError }}>
      <ReactRouter.BrowserRouter basename={process.env.PUBLIC_URL}>
        <Component.Topbar />
        <Component.Error error={error} />
        <ReactRouter.Routes>
          <ReactRouter.Route path="/" element={<Now />} />
          <ReactRouter.Route path="/tests" element={<Tests />} />
          <ReactRouter.Route path="*" element={<p>URL Not Found</p>} />
        </ReactRouter.Routes>
      </ReactRouter.BrowserRouter>
    </AppContext.Provider>
  );
};

const Now: React.FunctionComponent = () => {
  const controller = useController();
  if (!controller) return <h1>Loading...</h1>;
  return (
    <React.Fragment>
      <h1>Now</h1>
      <Page.Now state={controller} />
    </React.Fragment>
  );
};

const Tests: React.FunctionComponent = () => {
  const results = useTestResults();
  if (!results) return <h1>Loading...</h1>;
  return (
    <React.Fragment>
      <h1>Tests</h1>
      <Page.Tests results={results} />
    </React.Fragment>
  );
};

export default App;
