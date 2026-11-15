import React from "react";
import { LANGUAGES } from "../config.js";
import { useApp } from "../context.jsx";
import RouteIcon from "./RouteIcon.jsx";
import PageLink from "./PageLink.jsx";
export default function Header() {
  const {
    tx,
    lang,
    page,
    navigate,
    saved,
    mobileMenu,
    setMobileMenu,
    setLocale,
    auth,
  } = useApp();
  return (
    <header className="site-header">
      <div className="header-inner">
        <PageLink
          page="home"
          className="brand"
          onNavigate={() => navigate("home")}
          aria-label="KU Bridge Home"
        >
          <span className="logo-mark">
            KU<span>.</span>
          </span>
          <span className="brand-title">
            <b>Bridge</b>
            <small>KONKUK UNIVERSITY · SEOUL</small>
          </span>
        </PageLink>
        <nav
          id="main-navigation"
          className={"header-nav " + (mobileMenu ? "open" : "")}
          aria-label="Main navigation"
        >
          {[
            ["home", "navHome"],
            ["explore", "navExplore"],
            ["help", "navHelp"],
            ["checklist", "navChecklist"],
            ["saved", "navSaved"],
            ["account", auth.user ? "authAccount" : "authLogin"],
          ].map(([to, key]) => (
            <PageLink
              page={to}
              key={to}
              className={page === to ? "active" : ""}
              aria-current={page === to ? "page" : undefined}
              onNavigate={() => navigate(to)}
            >
              {tx(key)}
              {to === "saved" && saved.length > 0 && (
                <span className="nav-count">{saved.length}</span>
              )}
            </PageLink>
          ))}
        </nav>
        <div className="language-control">
          <RouteIcon name="globe" size={17} />
          <div className="language-buttons">
            {LANGUAGES.map(([code, label]) => (
              <button
                key={code}
                className={lang === code ? "active" : ""}
                onClick={() => setLocale(code)}
                aria-label={"Language " + label}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            aria-label={tx("locale")}
            value={lang}
            onChange={(e) => setLocale(e.target.value)}
          >
            {LANGUAGES.map(([code, label]) => (
              <option value={code} key={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenu((x) => !x)}
          aria-label={tx("menu")}
          aria-expanded={mobileMenu}
          aria-controls="main-navigation"
        >
          <RouteIcon name={mobileMenu ? "x" : "menu"} size={23} />
        </button>
      </div>
    </header>
  );
}
