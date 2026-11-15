import React from "react";
import { SOURCES } from "../services/catalog.js";
import RouteIcon from "./RouteIcon.jsx";
export function sourceLink(source, content, className = "") {
  const src = SOURCES[source];
  return (
    <a
      className={className}
      href={src.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content || src.name} <RouteIcon name="external" size={14} />
    </a>
  );
}
