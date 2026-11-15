import React, { useState } from "react";
import { identityReady } from "../communityConfig.js";
import { useApp } from "../context.jsx";
import { communityErrorKey } from "../services/community.js";
export default function ContentTools({
  item,
  own,
  service,
  blocked,
  onEdit,
  onChange,
}) {
  const { tx, auth } = useApp();
  const [report, setReport] = useState(false),
    [reason, setReason] = useState("spam"),
    [details, setDetails] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(null);
  async function run(action, done) {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage(done);
      onChange?.();
    } catch (error) {
      setMessage(communityErrorKey(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="content-tools">
      {own ? (
        <>
          {onEdit && (
            <button disabled={busy} onClick={onEdit}>
              {tx("edit")}
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => {
              if (window.confirm(tx("deleteContentConfirm")))
                void run(
                  () => service.remove(auth.user.uid, item),
                  "contentDeleted",
                );
            }}
          >
            {tx("delete")}
          </button>
        </>
      ) : (
        <>
          {item.authorId && (
            <button
              disabled={busy}
              onClick={() =>
                run(
                  () => service.block(auth.user.uid, item.authorId, !blocked),
                  blocked ? "unblocked" : "blocked",
                )
              }
            >
              {tx(blocked ? "unblock" : "blockUser")}
            </button>
          )}
          <button
            disabled={
              busy ||
              !auth.user?.emailVerified ||
              !identityReady(auth.profile) ||
              auth.suspended
            }
            onClick={() => setReport((value) => !value)}
          >
            {tx("report")}
          </button>
        </>
      )}
      {message && <p role="status">{tx(message)}</p>}
      {report && (
        <form
          className="report-form"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await service.report(
                auth.user.uid,
                {
                  roomId: item.roomId,
                  kind: item.kind,
                  parentId: item.parentId || "",
                  contentId: item.contentId,
                },
                reason,
                details,
              );
              setReport(false);
            }, "reported");
          }}
        >
          <label>
            {tx("reportReason")}
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              {["spam", "harassment", "personal_info", "other"].map((key) => (
                <option key={key} value={key}>
                  {tx(`report_${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {tx("reportDetails")}
            <textarea
              maxLength={1000}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </label>
          <button className="auth-button secondary" disabled={busy}>
            {tx("sendReport")}
          </button>
        </form>
      )}
    </div>
  );
}
