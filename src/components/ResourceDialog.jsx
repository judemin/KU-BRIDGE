import React, { useEffect, useRef } from "react";
import { useApp } from "../context.jsx";
import { RESOURCES, SOURCES, DETAILS } from "../services/catalog.js";
import { sourceLink } from "./SourceLink.jsx";
import RouteIcon from "./RouteIcon.jsx";
export default function ResourceDialog() {
  const { tx, lang, selected, setSelected, saved, toggleSaved, personalBusy } =
    useApp();
  const dialogRef = useRef(null);
  const activeResource = RESOURCES.find((item) => item.id === selected);
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "Tab") {
        const elements = dialogRef.current?.querySelectorAll(
          'button,a[href],select,input,[tabindex="0"]',
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialogRef.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === dialogRef.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [selected]);

  return activeResource ? (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={activeResource.title[lang]}
        tabIndex="-1"
      >
        <div className="modal-top">
          <span className={"source-kind " + activeResource.kind}>
            {tx(activeResource.kind)}
          </span>
          <button onClick={() => setSelected(null)} aria-label={tx("close")}>
            <RouteIcon name="x" size={20} />
          </button>
        </div>
        <h2>{activeResource.title[lang]}</h2>
        <div className="modal-detail-grid">
          <div>
            <small>{tx("cat")}</small>
            <p>{tx(activeResource.category)}</p>
          </div>
          <div>
            <small>{tx("stage")}</small>
            <p>{tx(activeResource.stage)}</p>
          </div>
          <div>
            <small>{tx("studentType")}</small>
            <p>{activeResource.audience.map((x) => tx(x)).join("  /  ")}</p>
          </div>
          <div>
            <small>{tx("sourceKind")}</small>
            <p>{tx(activeResource.kind)}</p>
          </div>
        </div>
        <div className="modal-content">
          <div className="detail-section">
            <b>{tx("detailAbout")}</b>
            <p>{DETAILS[activeResource.id].description[lang]}</p>
          </div>
          <div className="detail-section next-step">
            <b>{tx("detailNext")}</b>
            <p>{DETAILS[activeResource.id].action[lang]}</p>
          </div>
          <div className="detail-section">
            <b>{tx("source")}</b>
            <p>
              {SOURCES[activeResource.source].name}  / {" "}
              {SOURCES[activeResource.source].date}
            </p>
            <p className="evidence-note">{tx(activeResource.kind)}</p>
          </div>
          <div className="detail-warning">{tx("verifyAlert")}</div>
        </div>
        <div className="modal-actions">
          {sourceLink(
            activeResource.source,
            tx("openSource"),
            "primary link-button",
          )}
          <button
            className="outline"
            disabled={personalBusy}
            onClick={() => toggleSaved(activeResource.id)}
          >
            <RouteIcon name="bookmark" size={17} />{" "}
            {tx(saved.includes(activeResource.id) ? "saved" : "save")}
          </button>
        </div>
      </div>
    </div>
  ) : null;
}
