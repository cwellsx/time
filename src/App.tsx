import React from 'react';
import * as ReactRouter from 'react-router-dom';

import { useController, useTestResults } from './ts_hooks';
import * as Component from './tsx_components';
import * as Page from './tsx_pages';

//import './App.css';
const App: React.FunctionComponent = () => {
  return (
    <ReactRouter.BrowserRouter basename={process.env.PUBLIC_URL}>
      <Component.Topbar />
      <ReactRouter.Routes>
        <ReactRouter.Route path="/" element={<Now />} />
        <ReactRouter.Route path="/tests" element={<Tests />} />
        <ReactRouter.Route path="*" element={<p>URL Not Found</p>} />
      </ReactRouter.Routes>
    </ReactRouter.BrowserRouter>
  );
};

const Now: React.FunctionComponent = () => {
  const controller = useController();
  if (!controller) return <h1>Loading...</h1>;
  return (
    <React.Fragment>
      <h1>Now</h1>
      <Page.Now text="Hello world" state={controller} />
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
