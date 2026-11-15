import React, { useState } from "react";
import { useApp } from "../context.jsx";
import { RESOURCES } from "../services/catalog.js";
import { ISSUE_CARDS } from "../config.js";
import RouteIcon from "../components/RouteIcon.jsx";
import ResourceCards from "../components/ResourceCards.jsx";
export default function HomePage() {
  const { tx, navigate, chooseIssue } = useApp();
  const [query, setQuery] = useState("");
  const renderCards = (items) => <ResourceCards items={items} />;
  return (
    <>
      <section className="hero container">
        <div className="hero-text">
          <p className="hero-label">{tx("heroEyebrow")}</p>
          <h1>{tx("heroTitle")}</h1>
          <p>{tx("heroDesc")}</p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              const term = query;
              navigate("explore", { q: term });
            }}
          >
            <label className="sr-only" htmlFor="home-search">
              {tx("searchPlaceholder")}
            </label>
            <RouteIcon name="search" size={21} />
            <input
              id="home-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tx("searchPlaceholder")}
            />
            <button className="primary" type="submit">
              {tx("search")}
            </button>
          </form>
          <div className="hero-topics">
            <span>{tx("quickTopics")}</span>
            {["askVisa", "askFunding", "askHousing"].map((key) => (
              <button
                key={key}
                onClick={() => {
                  navigate("help", { topic: key });
                }}
              >
                {tx(key)}
                <RouteIcon name="arrow" size={13} />
              </button>
            ))}
          </div>
        </div>
        <aside className="quick-guide">
          <p className="eyebrow">{tx("quickGuide")}</p>
          {[
            ["explore", "navExplore", "quickExploreDesc"],
            ["help", "navHelp", "quickHelpDesc"],
            ["checklist", "navChecklist", "quickCheckDesc"],
          ].map(([to, title, description], index) => (
            <button key={to} onClick={() => navigate(to)}>
              <span className="quick-number">0{index + 1}</span>
              <span>
                <b>{tx(title)}</b>
                <small>{tx(description)}</small>
              </span>
              <RouteIcon name="arrow" size={19} />
            </button>
          ))}
        </aside>
      </section>
      <div className="container">
        <div className="notice">
          <span>ⓘ</span>
          <p>{tx("notice")}</p>
        </div>
      </div>
      <section className="container section issues-section" id="issues">
        <div className="section-heading">
          <div>
            <h2>{tx("sectionIssues")}</h2>
            <p>{tx("sectionIssuesDesc")}</p>
          </div>
        </div>
        <div className="issue-grid">
          {ISSUE_CARDS.map((issue, index) => (
            <button
              className={"issue-card issue-" + index}
              key={issue.id}
              onClick={() => chooseIssue(issue)}
            >
              <span className="issue-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <b>{tx(issue.title)}</b>
              <small>{tx(issue.desc)}</small>
              <span className="issue-arrow">
                <RouteIcon name="arrow" size={19} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="container section preview-section">
        <div className="section-heading">
          <div>
            <h2>{tx("sectionExplore")}</h2>
            <p>{tx("sectionExploreDesc")}</p>
          </div>
          <button className="outline small" onClick={() => navigate("explore")}>
            {tx("viewAll")} <RouteIcon name="arrow" size={16} />
          </button>
        </div>
        {renderCards(
          RESOURCES.filter((r) =>
            [
              "writingClinic",
              "intlScholarship",
              "ibuddy",
              "gradChecklist",
              "visa",
              "dormApply",
            ].includes(r.id),
          ),
        )}
      </section>
      <section className="container trust-section">
        <div>
          <h2>{tx("trustTitle")}</h2>
          <p>{tx("trustDesc")}</p>
        </div>
        <div className="trust-tags">
          <span>{tx("direct")}</span>
          <span>{tx("path")}</span>
          <span>{tx("historical")}</span>
        </div>
      </section>
    </>
  );
}
