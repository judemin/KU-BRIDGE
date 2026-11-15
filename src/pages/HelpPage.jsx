import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { AUDIENCES } from "../services/catalog.js";
import { QUESTIONS } from "../config.js";
import { getRoute, makeInquiryText } from "../routing.js";
import { sourceLink } from "../components/SourceLink.jsx";
export default function HelpPage() {
  const {
    tx,
    lang,
    helpAudience,
    setHelpAudience,
    helpQuestion,
    setHelpQuestion,
  } = useApp();
  const route = getRoute(helpQuestion, helpAudience);
  const [copied, setCopied] = useState(false),
    [copyFailed, setCopyFailed] = useState(false);
  const timer = useRef();
  useEffect(() => {
    setCopied(false);
    setCopyFailed(false);
    return () => clearTimeout(timer.current);
  }, [lang, helpAudience, helpQuestion]);
  const inquiryText = () =>
    makeInquiryText(lang, tx(helpAudience), tx(helpQuestion));
  async function copyInquiry() {
    try {
      await navigator.clipboard.writeText(inquiryText());
      setCopied(true);
      setCopyFailed(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }
  return (
    <section className="container page-section section narrow-page">
      <div className="section-heading">
        <div>
          <h1>{tx("askTitle")}</h1>
          <p>{tx("askDesc")}</p>
        </div>
      </div>
      <div className="help-form">
        <label>
          {tx("studentType")}
          <select
            value={helpAudience}
            onChange={(e) => setHelpAudience(e.target.value)}
          >
            {AUDIENCES.filter((x) => x !== "all").map((x) => (
              <option key={x} value={x}>
                {tx(x)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {tx("askTopic")}
          <select
            value={helpQuestion}
            onChange={(e) => setHelpQuestion(e.target.value)}
          >
            {QUESTIONS.map((x) => (
              <option key={x} value={x}>
                {tx(x)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="route-results">
        <div className="route-step">
          <span className="step-no">01</span>
          <div>
            <small>{tx("askPrimary")}</small>
            <h3>{tx(route.primary)}</h3>
            {sourceLink(route.source, tx("openSource"), "inline-link")}
          </div>
        </div>
        <div className="route-step">
          <span className="step-no">02</span>
          <div>
            <small>{tx("askSecondary")}</small>
            <h3>{tx(route.secondary)}</h3>
            <p>{tx("verifyAlert")}</p>
          </div>
        </div>
        <div className="route-step">
          <span className="step-no">03</span>
          <div>
            <small>{tx("askPrep")}</small>
            <p>{tx("askGenericPrep")}</p>
          </div>
        </div>
      </div>
      <div className="inquiry-template">
        <div>
          <h3>{tx("askTemplate")}</h3>
          <p className="inquiry-text">{inquiryText()}</p>
          <span role="status" aria-live="polite">
            {copyFailed ? tx("copyFailed") : copied ? tx("copied") : ""}
          </span>
        </div>
        <button className="outline" onClick={copyInquiry}>
          {copied ? tx("copied") : tx("copy")}
        </button>
      </div>
    </section>
  );
}
