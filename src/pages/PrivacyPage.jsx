import React from "react";
import { useApp } from "../context.jsx";
import PageLink from "../components/PageLink.jsx";
export default function PrivacyPage() {
  const { tx } = useApp();
  return (
    <section className="container page-section privacy-page">
      <h1>{tx("authPrivacy")}</h1>
      <p>{tx("privacyIntro")}</p>
      {["Data", "Use", "Delete", "Local"].map((part) => (
        <section key={part}>
          <h2>{tx(`privacy${part}Title`)}</h2>
          <p>{tx(`privacy${part}`)}</p>
        </section>
      ))}
      <section>
        <h2>{tx("communityRules")}</h2>
        <p>{tx("rulesText")}</p>
      </section>
      <PageLink page="account" className="auth-text-link">
        {tx("authAccount")}
      </PageLink>
    </section>
  );
}
