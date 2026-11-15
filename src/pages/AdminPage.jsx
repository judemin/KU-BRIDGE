import React, { useEffect, useState } from "react";
import { useApp } from "../context.jsx";
import PageLink from "../components/PageLink.jsx";
import { moderationService } from "../services/moderation.js";
import { communityErrorKey } from "../services/community.js";
function ReportCard({ report, service, onChange }) {
  const { tx, auth } = useApp();
  const [target, setTarget] = useState(null),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  useEffect(() => {
    let active = true;
    void service
      .target(auth.user.uid, report)
      .then((item) => {
        if (active) setTarget(item);
      })
      .catch((err) => {
        if (active) setError(communityErrorKey(err));
      });
    return () => {
      active = false;
    };
  }, [report.id, service, auth.user.uid]);
  const act = async (action) => {
    if (busy || !reason.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      onChange();
    } catch (err) {
      setError(communityErrorKey(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="moderation-card">
      <h3>
        {tx(`report_${report.reason}`)}  /  {tx(`room_${report.roomId}`)}
      </h3>
      <p>{report.details}</p>
      {target ? (
        <blockquote>
          <strong>{target.authorId}</strong>
          <p>{target.title}</p>
          <p className="content-body">{target.body}</p>
        </blockquote>
      ) : (
        <p>{tx("postUnavailable")}</p>
      )}
      <label>
        {tx("moderationReason")}
        <input
          maxLength={500}
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <div className="auth-actions">
        {target && target.status !== "deleted" && (
          <>
            <button
              className="auth-button secondary"
              disabled={busy || !reason.trim()}
              onClick={() =>
                act(() =>
                  service.moderate(
                    auth.user.uid,
                    report,
                    target.status !== "hidden",
                    reason,
                    report.id,
                  ),
                )
              }
            >
              {tx(
                target.status === "hidden" ? "restoreContent" : "hideContent",
              )}
            </button>
            <button
              className="auth-button secondary"
              disabled={busy || !reason.trim()}
              onClick={() =>
                act(() =>
                  service.restrict(
                    auth.user.uid,
                    target.authorId,
                    true,
                    reason,
                  ),
                )
              }
            >
              {tx("suspendUser")}
            </button>
            <button
              className="auth-button secondary"
              disabled={busy || !reason.trim()}
              onClick={() =>
                act(() =>
                  service.restrict(
                    auth.user.uid,
                    target.authorId,
                    false,
                    reason,
                  ),
                )
              }
            >
              {tx("resumeUser")}
            </button>
          </>
        )}
        <button
          className="auth-button secondary"
          disabled={busy || !reason.trim()}
          onClick={() =>
            act(() => service.closeReport(auth.user.uid, report.id, reason))
          }
        >
          {tx("closeReport")}
        </button>
      </div>
      {error && <p role="alert">{tx(error)}</p>}
    </article>
  );
}
export default function AdminPage() {
  const { tx, auth, moderationApi, communityApi } = useApp();
  const service = moderationApi || moderationService;
  const [reports, setReports] = useState([]),
    [events, setEvents] = useState([]),
    [status, setStatus] = useState("open"),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [flags, setFlags] = useState(null),
    [message, setMessage] = useState(null),
    [cursor, setCursor] = useState(null),
    [more, setMore] = useState(false);
  useEffect(() => {
    if (!auth.isAdmin || !auth.user) return;
    let active = true;
    setError(null);
    setBusy(true);
    void Promise.all([
      service.reports(auth.user.uid, status),
      service.events(auth.user.uid),
    ])
      .then(([result, history]) => {
        if (active) {
          setReports(result.items);
          setCursor(result.cursor);
          setMore(result.hasMore);
          setEvents(history);
        }
      })
      .catch((err) => {
        if (active) setError(communityErrorKey(err));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [auth.user?.uid, auth.isAdmin, service, status, revision]);
  useEffect(() => {
    if (!auth.isAdmin || !auth.user) return;
    let stop,
      active = true;
    void (async () => {
      const source =
        communityApi ||
        (await import("../services/community.js")).communityService;
      if (active)
        stop = source.watchFlags(auth.user.uid, setFlags, (err) =>
          setError(communityErrorKey(err)),
        );
    })();
    return () => {
      active = false;
      stop?.();
    };
  }, [auth.user?.uid, auth.isAdmin, communityApi]);
  const run = async (action, key = "actionSaved", refresh = true) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(key);
      if (refresh) setRevision((value) => value + 1);
    } catch (err) {
      setError(communityErrorKey(err));
    } finally {
      setBusy(false);
    }
  };
  if (!auth.isAdmin)
    return (
      <section className="container page-section">
        <h1>{tx("adminTitle")}</h1>
        <p>{tx("adminOnly")}</p>
        <PageLink page="account">{tx("authAccount")}</PageLink>
      </section>
    );
  return (
    <section className="container page-section admin-page">
      <h1>{tx("adminTitle")}</h1>
      <PageLink page="community" className="auth-text-link">
        {tx("community")}
      </PageLink>
      {error && (
        <p role="alert" className="community-error">
          {tx(error)}
        </p>
      )}
      {message && <p role="status">{tx(message)}</p>}
      {flags && (
        <div className="admin-controls">
          <button
            className="auth-button secondary"
            disabled={busy}
            onClick={() =>
              run(() =>
                service.flags(auth.user.uid, {
                  ...flags,
                  communityEnabled: !flags.communityEnabled,
                }),
              )
            }
          >
            {tx(flags.communityEnabled ? "pauseCommunity" : "resumeCommunity")}
          </button>
          <button
            className="auth-button secondary"
            disabled={busy}
            onClick={() =>
              run(() =>
                service.flags(auth.user.uid, {
                  ...flags,
                  chatEnabled: !flags.chatEnabled,
                }),
              )
            }
          >
            {tx(flags.chatEnabled ? "pauseChat" : "resumeChat")}
          </button>
          <button
            className="auth-button secondary"
            disabled={busy}
            onClick={() => {
              if (window.confirm(tx("pruneConfirm")))
                void run(
                  () => service.pruneMessages(auth.user.uid),
                  "cleanupDone",
                );
            }}
          >
            {tx("pruneChat")}
          </button>
        </div>
      )}
      <label>
        {tx("report")}
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {[
            ["open", "openReports"],
            ["reviewed", "reviewedReports"],
            ["closed", "closedReports"],
          ].map(([key, label]) => (
            <option value={key} key={key}>
              {tx(label)}
            </option>
          ))}
        </select>
      </label>
      {busy && <p role="status">{tx("loading")}</p>}
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          service={service}
          onChange={() => setRevision((value) => value + 1)}
        />
      ))}
      {!busy && !reports.length && <p>{tx("noReports")}</p>}
      {more && (
        <button
          className="auth-text-link"
          disabled={busy}
          onClick={() =>
            run(
              async () => {
                const result = await service.reports(
                  auth.user.uid,
                  status,
                  cursor,
                );
                setReports((old) => [...old, ...result.items]);
                setCursor(result.cursor);
                setMore(result.hasMore);
              },
              null,
              false,
            )
          }
        >
          {tx("loadMore")}
        </button>
      )}
      <h2>{tx("moderationHistory")}</h2>
      <ol className="moderation-events">
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.action}</strong>
            <p>{event.target}</p>
            <p>{event.reason}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
