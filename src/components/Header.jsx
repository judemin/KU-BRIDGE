import React, { useState } from "react";
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
    authService,
  } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
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
            ["community", "community"],
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
        <div className="header-account">
          <PageLink
            page="account"
            className={"account-entry " + (!auth.user ? "login-entry" : "")}
            aria-label={tx(auth.user ? "authAccount" : "loginSignup")}
            onNavigate={() => navigate("account")}
          >
            <RouteIcon name="user" size={19} />
            <span>
              {auth.user
                ? auth.profile?.userId || tx("authAccount")
                : tx("loginSignup")}
            </span>
          </PageLink>
          {auth.user && (
            <button
              className="header-logout"
              disabled={loggingOut}
              aria-label={tx("authLogout")}
              onClick={async () => {
                setLoggingOut(true);
                setLogoutFailed(false);
                try {
                  await authService.logout();
                  navigate("home");
                } catch {
                  setLogoutFailed(true);
                } finally {
                  setLoggingOut(false);
                }
              }}
            >
              <RouteIcon name="logout" size={18} />
              <span>{tx("authLogout")}</span>
            </button>
          )}
          {logoutFailed && (
            <span className="header-account-error" role="alert">
              {tx("authErrorNetwork")}
            </span>
          )}
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
