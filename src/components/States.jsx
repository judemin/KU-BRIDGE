import React from "react";
import { useApp } from "../context.jsx";
import PageLink from "./PageLink.jsx";
import RouteIcon from "./RouteIcon.jsx";

export function LoadingState({ tx }) {
  return (
    <section
      className="container page-section status-page"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="loading-indicator" aria-hidden="true" />
      <p>{tx("loading")}</p>
    </section>
  );
}

export function EmptyState({ onClear }) {
  const { tx } = useApp();
  return (
    <div className="empty-state">
      <RouteIcon name="search" size={27} />
      <p>{tx("noResult")}</p>
      <button className="outline" onClick={onClear}>
        {tx("clear")}
      </button>
    </div>
  );
}

export function NotFoundPage() {
  const { tx } = useApp();
  return (
    <section className="container page-section status-page">
      <p className="eyebrow">404</p>
      <h1>{tx("notFoundTitle")}</h1>
      <p>{tx("notFoundDesc")}</p>
      <PageLink className="primary" page="home">
        {tx("navHome")}
        <RouteIcon name="arrow" size={17} />
      </PageLink>
    </section>
  );
}

export class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const { tx } = this.props;
    return (
      <section className="container page-section status-page" role="alert">
        <h1>{tx("errorTitle")}</h1>
        <p>{tx("errorDesc")}</p>
        <button
          className="primary"
          onClick={() => {
            if (this.props.onRetry) this.props.onRetry();
            this.setState({ failed: false });
          }}
        >
          {tx("retry")}
        </button>
        <a className="outline" href="/">
          {tx("navHome")}
        </a>
      </section>
    );
  }
}
