// import 'ui-assets/css/Topbar.css';
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
              Now <Icon.Now width="24" height="24" />
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/tags" title="Tags">
              Tags <Icon.Tags width="24" height="24" />
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/log" title="Log">
              Log <Icon.Log width="24" height="24" />
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/sum" title="Sum">
              Sum <Icon.Sum width="24" height="24" />
            </ReactRouter.NavLink>
          </li>
          <li className="icon">
            <ReactRouter.NavLink to="/settings" title="Settings">
              Settings <Icon.Settings width="24" height="24" />
            </ReactRouter.NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};
