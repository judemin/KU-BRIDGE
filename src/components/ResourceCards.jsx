import React from "react";
import { useApp } from "../context.jsx";
import { SOURCES, DETAILS } from "../services/catalog.js";
import RouteIcon from "./RouteIcon.jsx";
import { EmptyState } from "./States.jsx";
export default function ResourceCards({ items }) {
  const { tx, lang, saved, toggleSaved, setSelected, clearFilters } = useApp();
  return items.length ? (
    <div className="resource-grid">
      {items.map((item) => (
        <article className="resource-card" key={item.id}>
          <div className="resource-meta">
            <span className={"source-kind " + item.kind}>{tx(item.kind)}</span>
            <span>{tx(item.category)}</span>
          </div>
          <div className="resource-header">
            <button
              className={
                "save-icon " + (saved.includes(item.id) ? "is-saved" : "")
              }
              onClick={() => toggleSaved(item.id)}
              aria-label={
                tx(saved.includes(item.id) ? "saved" : "save") +
                " " +
                item.title[lang]
              }
              title={tx(saved.includes(item.id) ? "saved" : "save")}
            >
              <RouteIcon name="bookmark" size={18} />
            </button>
          </div>
          <h3>{item.title[lang]}</h3>
          <p className="resource-summary">
            {DETAILS[item.id].description[lang]}
          </p>
          <p className="resource-caption">{SOURCES[item.source].name}</p>
          <div className="resource-bottom">
            <span>{tx(item.stage)}</span>
            <button className="text-link" onClick={() => setSelected(item.id)}>
              {tx("details")}
              <RouteIcon name="arrow" size={15} />
            </button>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <EmptyState onClear={clearFilters} />
  );
}
