import React from "react";
import { useApp } from "../context.jsx";
import { AUDIENCES } from "../services/catalog.js";
import { sourceLink } from "../components/SourceLink.jsx";
import RouteIcon from "../components/RouteIcon.jsx";
export default function ChecklistPage() {
  const {
    tx,
    checkAudience,
    currentChecks,
    completion,
    checked,
    setChecked,
    setAudience,
    toggleCheck,
    personalBusy,
  } = useApp();
  return (
    <section className="container page-section section narrow-page">
      <div className="section-heading">
        <div>
          <h1>{tx("checkTitle")}</h1>
          <p>{tx("checkDesc")}</p>
        </div>
      </div>
      <label className="standalone-select">
        {tx("studentType")}
        <select
          value={checkAudience}
          onChange={(e) => setAudience(e.target.value)}
        >
          {AUDIENCES.filter((x) => x !== "all").map((x) => (
            <option key={x} value={x}>
              {tx(x)}
            </option>
          ))}
        </select>
      </label>
      <div className="progress-top">
        <b>
          {completion} / {currentChecks.length} {tx("checkProgress")}
        </b>
        <span>{Math.round((completion / currentChecks.length) * 100)}%</span>
      </div>
      <div className="progress-track">
        <div
          style={{
            width: (completion / currentChecks.length) * 100 + "%",
          }}
        />
      </div>
      <div className="check-items">
        {currentChecks.map((key, idx) => (
          <label
            key={key}
            className={
              "check-item " + (checked[checkAudience + ":" + key] ? "done" : "")
            }
          >
            <input
              type="checkbox"
              disabled={personalBusy}
              checked={!!checked[checkAudience + ":" + key]}
              onChange={() => toggleCheck(key)}
            />
            <span className="check-indicator">
              <RouteIcon name="check" size={15} />
            </span>
            <span>{tx(key)}</span>
            <small>{String(idx + 1).padStart(2, "0")}</small>
          </label>
        ))}
      </div>
      <div className="check-footer">
        <button
          className="outline"
          disabled={personalBusy}
          onClick={() => {
            if (window.confirm(tx("checkReset") + "?"))
              setChecked((old) =>
                Object.fromEntries(
                  Object.entries(old).filter(
                    ([key]) => !key.startsWith(checkAudience + ":"),
                  ),
                ),
              );
          }}
        >
          {tx("checkReset")}
        </button>
        <span>{tx("checkOfficial")}</span>
      </div>
      <div className="check-docs">
        {sourceLink(
          checkAudience === "e" ? "exchangeGuide" : "guide",
          tx("openSource"),
          "inline-link",
        )}
      </div>
    </section>
  );
}
