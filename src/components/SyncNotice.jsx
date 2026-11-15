import React from "react";
import { useApp } from "../context.jsx";
export default function SyncNotice() {
  const {
    tx,
    personalStatus,
    personalBusy,
    personalError,
    retryPersonal,
    needsMigration,
    mergeGuest,
    keepSeparate,
  } = useApp();
  if (!needsMigration && !personalError && personalStatus !== "loading")
    return null;
  return (
    <aside className="container sync-notice" aria-label={tx("syncTitle")}>
      {personalStatus === "loading" && <p role="status">{tx("syncLoading")}</p>}
      {personalError && (
        <div role="alert">
          <p>{tx("syncError")}</p>
          <button className="auth-button secondary" onClick={retryPersonal}>
            {tx("retry")}
          </button>
        </div>
      )}
      {needsMigration && (
        <>
          <p>{tx("syncMergePrompt")}</p>
          <div className="auth-actions">
            <button
              className="auth-button"
              disabled={personalBusy}
              onClick={mergeGuest}
            >
              {tx("syncMerge")}
            </button>
            <button
              className="auth-button secondary"
              disabled={personalBusy}
              onClick={keepSeparate}
            >
              {tx("syncSeparate")}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
