//import './App.css';
import React from 'react';
import * as ReactRouter from 'react-router-dom';

import * as Component from './components';
import * as Page from './pages';

const App: React.FunctionComponent = () => {
  return (
    <ReactRouter.BrowserRouter basename={process.env.PUBLIC_URL}>
      <Component.Topbar />
      <AppRoutes />
    </ReactRouter.BrowserRouter>
  );
};

export const AppRoutes: React.FunctionComponent = () => {
  return (
    <ReactRouter.Routes>
      <ReactRouter.Route path="/" element={<Page.Now text="Hello world" />} />
      <ReactRouter.Route path="*" element={<p>URL Not Found</p>} />
    </ReactRouter.Routes>
  );
};

export default App;
