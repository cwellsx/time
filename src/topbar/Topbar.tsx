import './Topbar.sass';

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
            <ReactRouter.NavLink to="/tags" title="Tags">
              <Icon.Tags width="24" height="24" />
              <span>Tags</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/log" title="Log">
              <Icon.Log width="24" height="24" />
              <span>Log</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/sum" title="Sum">
              <Icon.Sum width="24" height="24" />
              <span>Sum</span>
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/settings" title="Settings">
              <Icon.Settings width="24" height="24" />
              <span>Settings</span>
            </ReactRouter.NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};
