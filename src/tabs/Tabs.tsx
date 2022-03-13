import "./tabs.sass";

import React from "react";
import * as ReactRouter from "react-router-dom";

export type TabLink = {
  text: string;
  url: string;
};

export type TabAction = {
  text: string;
  action: () => void;
};

/*
  it would also be possible to implement TabContent as shown in https://css-tricks.com/functional-css-tabs-revisited/

   <div class="tab">
       <input type="radio" id="tab-2" name="tab-group-1">
       <label for="tab-2">Tab Two</label>
       
       <div class="content">
           stuff
       </div> 
   </div>

  .content {
    position: absolute;
    top: 28px;
    left: 0;
    background: white;
    right: 0;
    bottom: 0;
    padding: 20px;
    border: 1px solid #ccc; 
  }
*/

export type TabContent = {
  text: string;
  content: React.ReactElement;
};

type TabLinkProps = {
  links: TabLink[];
};

type TabActionProps = {
  actions: TabAction[];
  selected: number;
};

export const Tabs: React.FunctionComponent<TabLinkProps | TabActionProps> = (props: TabLinkProps | TabActionProps) => {
  if ("links" in props) {
    const tabs = props.links;
    return (
      <div className="tabs">
        {tabs.map((tab) => {
          return (
            <ReactRouter.NavLink to={tab.url} title={tab.text}>
              {tab.text}
            </ReactRouter.NavLink>
          );
        })}
      </div>
    );
  } else {
    const tabs = props.actions;
    return (
      <div className="tabs">
        {tabs.map((tab, index) => {
          const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            event.preventDefault();
            tab.action();
          };
          const selected = index === props.selected;
          return (
            <a onClick={onClick} title={tab.text} className={selected ? "selected" : undefined} key={index}>
              {tab.text}
            </a>
          );
        })}
      </div>
    );
  }
};
