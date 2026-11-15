import React from "react";
import { useApp } from "../context.jsx";
import { AUDIENCES, CATEGORIES } from "../services/catalog.js";
import RouteIcon from "./RouteIcon.jsx";
export default function Filters() {
  const { tx, audience, setAudience, category, setCategory, query, setQuery } =
    useApp();
  return (
    <div className="explore-filters">
      <label>
        <span>{tx("studentType")}</span>
        <select value={audience} onChange={(e) => setAudience(e.target.value)}>
          {AUDIENCES.map((x) => (
            <option key={x} value={x}>
              {tx(x)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{tx("cat")}</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((x) => (
            <option key={x} value={x}>
              {tx(x)}
            </option>
          ))}
        </select>
      </label>
      <label className="search-wrap">
        <span>{tx("navExplore")}</span>
        <div>
          <RouteIcon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx("searchPlaceholder")}
            aria-label={tx("searchPlaceholder")}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              title={tx("clear")}
              aria-label={tx("clear")}
            >
              ×
            </button>
          )}
        </div>
      </label>
    </div>
  );
}
