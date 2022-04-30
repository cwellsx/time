import './App.sass';

import React from 'react';
import * as ReactRouter from 'react-router-dom';

import { AppErrorContext, ErrorMessage, useAppErrorContext } from './error';
import { AppTestingContext, useAppTestingContext, useController, useTestResults } from './io';
import * as Page from './pages';
import * as Component from './topbar';

// import { useHelp } from './fetch';

const App: React.FunctionComponent = () => {
  const [error, setError] = useAppErrorContext();
  const [testing, setTesting] = useAppTestingContext();
  return (
    <AppErrorContext.Provider value={{ setError }}>
      <AppTestingContext.Provider value={{ testing, setTesting }}>
        <ReactRouter.BrowserRouter basename={process.env.PUBLIC_URL}>
          <Component.ScrollToTop />
          <Component.Topbar />
          <div id="content">
            <ErrorMessage errorMessage={error} />
            <ReactRouter.Routes>
              <ReactRouter.Route path="/" element={<Now />} />
              <ReactRouter.Route path="/what" element={<What />} />
              <ReactRouter.Route path="/history" element={<History />} />
              <ReactRouter.Route path="/settings" element={<Settings />} />
              <ReactRouter.Route path="/help" element={<Help />}>
                <ReactRouter.Route path=":helpId" element={<Help />} />
              </ReactRouter.Route>
              <ReactRouter.Route path="/tests" element={<Tests />} />
              <ReactRouter.Route path="*" element={<p>URL Not Found</p>} />
            </ReactRouter.Routes>
          </div>
        </ReactRouter.BrowserRouter>
      </AppTestingContext.Provider>
    </AppErrorContext.Provider>
  );
};

const Now: React.FunctionComponent = () => {
  console.log("Now");
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
  console.log("What");
  const controller = useController();
  if (!controller) return <h1>Loading...</h1>;
  return (
    <React.Fragment>
      <h1>What</h1>
      <Page.What state={controller} />
    </React.Fragment>
  );
};

const History: React.FunctionComponent = () => {
  console.log("History");
  const controller = useController();
  const [searchParams] = ReactRouter.useSearchParams();
  if (!controller) return <h1>Loading...</h1>;
  const task = searchParams.get("task") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  return (
    <React.Fragment>
      <h1>History</h1>
      <Page.History state={controller} task={task} tag={tag} />
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

const Help: React.FunctionComponent = () => {
  let { helpId } = ReactRouter.useParams();
  console.log(helpId);
  return (
    <React.Fragment>
      <Component.Help helpId={helpId} />
    </React.Fragment>
  );
};

const Tests: React.FunctionComponent = () => {
  const testResults = useTestResults();
  if (!testResults) return <h1>Loading...</h1>;
  return (
    <React.Fragment>
      <h1>Tests</h1>
      <Page.Tests testResults={testResults} />
    </React.Fragment>
  );
};

export default App;
