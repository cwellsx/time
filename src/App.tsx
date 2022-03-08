import './App.sass';

import React from 'react';
import * as ReactRouter from 'react-router-dom';

import { ErrorMessage } from './error';
import { AppContext, useController, useError, useTestResults } from './io';
import * as Page from './pages';
import * as Component from './topbar';

const App: React.FunctionComponent = () => {
  const [error, setError] = useError();
  return (
    <AppContext.Provider value={{ setError }}>
      <ReactRouter.BrowserRouter basename={process.env.PUBLIC_URL}>
        <Component.Topbar />
        <div id="content">
          <ErrorMessage errorMessage={error} />
          <ReactRouter.Routes>
            <ReactRouter.Route path="/" element={<Now />} />
            <ReactRouter.Route path="/what" element={<What />} />
            <ReactRouter.Route path="/settings" element={<Settings />} />
            <ReactRouter.Route path="/tests" element={<Tests />} />
            <ReactRouter.Route path="*" element={<p>URL Not Found</p>} />
          </ReactRouter.Routes>
        </div>
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

const What: React.FunctionComponent = () => {
  const controller = useController();
  if (!controller) return <h1>Loading...</h1>;
  return (
    <React.Fragment>
      <h1>What</h1>
      <Page.What state={controller} />
    </React.Fragment>
  );
};

const Settings: React.FunctionComponent = () => {
  const controller = useController();
  if (!controller) return <h1>Loading...</h1>;
  return (
    <React.Fragment>
      <h1>Settings</h1>
      <Page.Settings state={controller} />
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
