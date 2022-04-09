import './topbar.sass';

import React from 'react';
import * as ReactRouter from 'react-router-dom';

import { pages } from './pageProperties';

export const Topbar: React.FunctionComponent = () => {
  return (
    <div className="topbar">
      <div className="container">
        <ul className="icons">
          {pages.map((it) => (
            <li key={it.title} className="icon">
              <ReactRouter.NavLink to={it.href} title={it.title}>
                <it.icon width="24" height="24" />
                <span>{it.title}</span>
              </ReactRouter.NavLink>
            </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
