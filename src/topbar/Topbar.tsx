import './topbar.sass';

import React from 'react';
import * as ReactRouter from 'react-router-dom';

import * as Icon from './icons';

export const Topbar: React.FunctionComponent = () => {
  return (
    <div className="topbar">
      <div className="container">
        <ul className="icons">
          <li className="icon">
            <ReactRouter.NavLink to="/" title="Now">
              <Icon.Now width="24" height="24" />
              <span>Now</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/what" title="Tags">
              <Icon.Tags width="24" height="24" />
              <span>What</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/history" title="History">
              <Icon.History width="24" height="24" />
              <span>History</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/settings" title="Settings">
              <Icon.Settings width="24" height="24" />
              <span>Settings</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/help" title="Help">
              <Icon.Help width="24" height="24" />
              <span>Help</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/tests" title="Tests">
              <Icon.Tests width="24" height="24" />
              <span>Tests</span>
            </ReactRouter.NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};
