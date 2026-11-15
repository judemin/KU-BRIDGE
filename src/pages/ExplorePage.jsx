import React from "react";
import { useApp } from "../context.jsx";
import Filters from "../components/Filters.jsx";
import ResourceCards from "../components/ResourceCards.jsx";
export default function ExplorePage() {
  const { tx, page, list, recommend, setRecommend } = useApp();
  return (
    <section className="container section page-section">
      <div className="section-heading">
        <div>
          <h1>{tx(page === "saved" ? "navSaved" : "sectionExplore")}</h1>
          <p>{tx(page === "saved" ? "savedDesc" : "sectionExploreDesc")}</p>
        </div>
        <span className="count-pill" role="status" aria-live="polite">
          {list.length} {tx("showing")}
        </span>
      </div>
      <Filters />
      {recommend && (
        <button className="active-filter" onClick={() => setRecommend(null)}>
          × {tx("clear")}
        </button>
      )}
      <ResourceCards items={list} />
    </section>
  );
}
