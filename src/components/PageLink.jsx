import React from "react";
import { pageUrl, changeLocation } from "../navigation.js";

export default function PageLink({
  page,
  params,
  onNavigate,
  children,
  ...props
}) {
  return (
    <a
      {...props}
      href={pageUrl(page, params)}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.currentTarget.target === "_blank"
        )
          return;
        event.preventDefault();
        if (onNavigate) onNavigate();
        else changeLocation(page, params);
      }}
    >
      {children}
    </a>
  );
}
