import React from "react";
import { useApp } from "../context.jsx";
import { sourceLink } from "./SourceLink.jsx";
import PageLink from "./PageLink.jsx";
export default function Footer() {
  const { tx } = useApp();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-logo">
            KU<span>.</span> Bridge
          </div>
          <p>{tx("footer")}</p>
          <small>{tx("localNotice")}</small>
        </div>
        <div className="footer-links">
          <PageLink page="privacy">{tx("authPrivacy")}</PageLink>
          {sourceLink("ciss", "International Student Center")}
          {sourceLink("exchange", "Office of International Affairs")}
          {sourceLink("main", "Konkuk University")}
        </div>
      </div>
      <div className="container footer-last">KU Bridge  /  {tx("subbrand")}</div>
    </footer>
  );
}
