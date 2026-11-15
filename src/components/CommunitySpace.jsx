import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { useLocation, parseLocation } from "../navigation.js";
import PageLink from "../components/PageLink.jsx";
import ContentTools from "../components/ContentTools.jsx";
import { communityService, communityErrorKey } from "../services/community.js";
import {
  ROOM_IDS,
  validRoom,
  identityReady,
  countryName,
  countryFlag,
} from "../communityConfig.js";

function useVisible() {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const listener = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, []);
  return visible;
}
function Author({ item, lang, tx, showFlag = true }) {
  return (
    <div className="content-author">
      <b>{item.authorId || tx("deletedAuthor")}</b>
      {item.nationality && (
        <span>
          {countryName(item.nationality, lang)}
          {showFlag && countryFlag(item.nationality) && (
            <img
              className="country-flag"
              src={countryFlag(item.nationality)}
              alt=""
              aria-hidden="true"
              width="20"
              height="15"
            />
          )}
        </span>
      )}
      <time>
        {item.createdAt?.toDate?.().toLocaleString(lang) || tx("justNow")}
      </time>
    </div>
  );
}
function Composer({
  kind,
  room,
  parent = "",
  service,
  initial,
  onDone,
  onCancel,
}) {
  const { tx, auth } = useApp();
  const [body, setBody] = useState(initial?.body || ""),
    [title, setTitle] = useState(initial?.title || ""),
    [category, setCategory] = useState(initial?.category || "general"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const job = useRef(null),
    lock = useRef(false);
  return (
    <form
      className="community-composer"
      onSubmit={async (event) => {
        event.preventDefault();
        if (
          lock.current ||
          !body.trim() ||
          (kind === "post" && title.trim().length < 3)
        )
          return;
        lock.current = true;
        setBusy(true);
        setError(null);
        try {
          let id;
          if (initial) {
            await service.edit(
              auth.user.uid,
              { roomId: room, kind, parentId: parent, contentId: initial.id },
              { title, body, category },
            );
            id = initial.id;
          } else {
            const signature = JSON.stringify({ title, body, category });
            if (!job.current || job.current.signature !== signature)
              job.current = {
                signature,
                id: await service.newId(auth.user.uid),
              };
            id = await service.publish(auth.user.uid, {
              roomId: room,
              kind,
              parentId: parent,
              contentId: job.current.id,
              title,
              body,
              category,
            });
          }
          setBody("");
          setTitle("");
          job.current = null;
          onDone?.(id);
        } catch (failure) {
          setError(communityErrorKey(failure));
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        {kind === "post" && (
          <>
            <label>
              {tx("postTitle")}
              <input
                name="postTitle"
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              {tx("postCategory")}
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {["general", "question", "life", "study", "exchange"].map(
                  (key) => (
                    <option value={key} key={key}>
                      {tx(`category_${key}`)}
                    </option>
                  ),
                )}
              </select>
            </label>
          </>
        )}
        <label>
          {tx(kind === "comment" ? "commentBody" : "postBody")}
          <textarea
            name={kind === "post" ? "postBody" : "commentBody"}
            required
            maxLength={kind === "post" ? 4000 : 1000}
            rows={kind === "post" ? 7 : 3}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        <div className="auth-actions">
          <button className="auth-button" type="submit">
            {tx(busy ? "authBusy" : initial ? "saveChanges" : "publish")}
          </button>
          {onCancel && (
            <button
              type="button"
              className="auth-button secondary"
              onClick={onCancel}
            >
              {tx("authCancel")}
            </button>
          )}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="community-error">
          {tx(error)}
        </p>
      )}
    </form>
  );
}
function Comments({ room, post, service, blocked, canWrite }) {
  const { tx, lang, auth } = useApp();
  const [items, setItems] = useState([]),
    [older, setOlder] = useState([]),
    [error, setError] = useState(null),
    [editing, setEditing] = useState(null),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(0);
  const cursor = useRef(null);
  useEffect(() => {
    setOlder([]);
    cursor.current = null;
    return service.watchComments(
      auth.user.uid,
      room,
      post.id,
      (rows) => {
        setItems(rows);
        setError(null);
        if (!cursor.current) setMore(rows.length === 30);
      },
      (err) => setError(communityErrorKey(err)),
    );
  }, [room, post.id, auth.user.uid, service, revision]);
  const all = [
    ...new Map([...older, ...items].map((item) => [item.id, item])).values(),
  ].sort(
    (a, b) =>
      (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0),
  );
  return (
    <section className="comment-section">
      <h3>{tx("comments")}</h3>
      {error && <p role="alert">{tx(error)}</p>}
      {all
        .filter((item) => !blocked.includes(item.authorId))
        .map((item) => (
          <article className="comment" key={item.id}>
            <Author item={item} lang={lang} tx={tx} />
            {editing === item.id ? (
              <Composer
                kind="comment"
                room={room}
                parent={post.id}
                service={service}
                initial={item}
                onDone={() => {
                  setEditing(null);
                  setRevision((value) => value + 1);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <p className="content-body">{item.body}</p>
            )}
            <ContentTools
              item={{
                ...item,
                roomId: room,
                kind: "comment",
                parentId: post.id,
                contentId: item.id,
              }}
              own={auth.profile?.userId === item.authorId}
              service={service}
              blocked={false}
              onChange={() => setRevision((value) => value + 1)}
              onEdit={canWrite ? () => setEditing(item.id) : undefined}
            />
          </article>
        ))}
      {more && (
        <button
          className="auth-text-link"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const result = await service.olderComments(
                auth.user.uid,
                room,
                post.id,
                cursor.current || items.at(-1)?.cursor,
              );
              setOlder((old) => [...old, ...result.items]);
              cursor.current = result.cursor;
              setMore(result.hasMore);
            } catch (err) {
              setError(communityErrorKey(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          {tx("loadMore")}
        </button>
      )}
      {canWrite && post.status === "visible" && (
        <Composer
          kind="comment"
          room={room}
          parent={post.id}
          service={service}
        />
      )}{" "}
    </section>
  );
}
function PostDetail({ room, id, service, blocked, canWrite, onBack }) {
  const { tx, lang, auth } = useApp();
  const [post, setPost] = useState(undefined),
    [error, setError] = useState(null),
    [editing, setEditing] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    setPost(undefined);
    setError(null);
    return service.watchPost(auth.user.uid, room, id, setPost, (err) =>
      setError(communityErrorKey(err)),
    );
  }, [room, id, auth.user.uid, service, retry]);
  if (error)
    return (
      <div>
        <p role="alert">{tx(error)}</p>
        <button
          className="auth-button secondary"
          onClick={() => setRetry((value) => value + 1)}
        >
          {tx("retry")}
        </button>
        <button className="auth-text-link" onClick={onBack}>
          {tx("backToPosts")}
        </button>
      </div>
    );
  if (post === undefined) return <p role="status">{tx("loading")}</p>;
  if (!post)
    return (
      <div>
        <p>{tx("postUnavailable")}</p>
        <button className="auth-text-link" onClick={onBack}>
          {tx("backToPosts")}
        </button>
      </div>
    );
  if (blocked.includes(post.authorId))
    return (
      <div>
        <p>{tx("blockedContent")}</p>
        <button className="auth-text-link" onClick={onBack}>
          {tx("backToPosts")}
        </button>
      </div>
    );
  return (
    <article className="post-detail">
      <button className="auth-text-link" onClick={onBack}>
        {tx("backToPosts")}
      </button>
      <h2>{post.status === "deleted" ? tx("deletedPost") : post.title}</h2>
      <Author item={post} lang={lang} tx={tx} />
      {editing ? (
        <Composer
          kind="post"
          room={room}
          service={service}
          initial={post}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <p className="content-body">{post.body}</p>
      )}
      {post.status !== "deleted" && (
        <ContentTools
          item={{
            ...post,
            roomId: room,
            kind: "post",
            parentId: "",
            contentId: id,
          }}
          own={auth.profile?.userId === post.authorId}
          service={service}
          blocked={false}
          onEdit={canWrite ? () => setEditing(true) : undefined}
        />
      )}
      <Comments
        key={id}
        room={room}
        post={post}
        service={service}
        blocked={blocked}
        canWrite={canWrite}
      />
    </article>
  );
}
function PostBoard({ room, postId, service, blocked, canWrite }) {
  const { tx, lang, auth, navigate } = useApp();
  const [items, setItems] = useState([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(null),
    [more, setMore] = useState(false),
    [revision, setRevision] = useState(0),
    [pageNumber, setPageNumber] = useState(1);
  const cursor = useRef(null),
    request = useRef(0),
    pages = useRef(new Map()),
    board = useRef(null);
  const accept = (result, number) => {
    setItems(result.items);
    cursor.current = result.cursor;
    setMore(result.hasMore);
    setPageNumber(number);
    pages.current.set(number, result);
  };
  useEffect(() => {
    let active = true;
    setBusy(true);
    setItems([]);
    setError(null);
    setPageNumber(1);
    pages.current.clear();
    cursor.current = null;
    void service
      .listPosts(auth.user.uid, room)
      .then((result) => {
        if (active) {
          accept(result, 1);
          setBusy(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(communityErrorKey(err));
          setBusy(false);
        }
      });
    return () => {
      active = false;
      request.current++;
    };
  }, [room, auth.user.uid, service, revision]);
  const go = async (number) => {
    if (busy || number < 1) return;
    const version = request.current;
    setBusy(true);
    setError(null);
    try {
      const cached = pages.current.get(number);
      const result =
        cached ||
        (await service.listPosts(auth.user.uid, room, cursor.current));
      if (version === request.current) {
        accept(result, number);
        board.current?.scrollIntoView?.({
          block: "start",
          behavior: "instant",
        });
      }
    } catch (err) {
      if (version === request.current) setError(communityErrorKey(err));
    } finally {
      if (version === request.current) setBusy(false);
    }
  };
  const open = (id) => navigate("community", { room, post: id });
  if (postId)
    return (
      <section className="community-board">
        <PostDetail
          key={postId}
          room={room}
          id={postId}
          service={service}
          blocked={blocked}
          canWrite={canWrite}
          onBack={() => navigate("community", { room })}
        />
      </section>
    );
  const numbers = [...pages.current.keys()].filter(
    (number) =>
      number === 1 ||
      Math.abs(number - pageNumber) <= 2 ||
      number === pages.current.size,
  );
  return (
    <section
      className="community-board"
      ref={board}
      aria-label={tx("board")}
      aria-busy={busy}
    >
      <div className="board-heading">
        <h2>{tx("board")}</h2>
        <div>
          <button
            className="auth-text-link"
            disabled={busy}
            onClick={() => setRevision((value) => value + 1)}
          >
            {tx("refreshPosts")}
          </button>
          {canWrite && (
            <button
              className="auth-button"
              onClick={() => navigate("postWrite", { room })}
            >
              {tx("writePost")}
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="community-error" role="alert">
          {tx(error)}
        </p>
      )}
      {busy && items.length === 0 && <p role="status">{tx("loading")}</p>}
      {!busy && !error && items.length === 0 && (
        <p className="community-empty">{tx("noPosts")}</p>
      )}
      <div className="post-list">
        {items
          .filter((item) => !blocked.includes(item.authorId))
          .map((item) => (
            <article className="post-row" key={item.id}>
              <span className="post-category">
                {tx(`category_${item.category}`)}
              </span>
              <button className="post-title" onClick={() => open(item.id)}>
                {item.title}
              </button>
              <p>{item.body.slice(0, 140)}</p>
              <Author item={item} lang={lang} tx={tx} />
            </article>
          ))}
      </div>

      {pages.current.size > 0 && (
        <nav className="board-pagination" aria-label={tx("boardPagination")}>
          <button
            className="pagination-direction"
            disabled={busy || pageNumber === 1}
            onClick={() => go(pageNumber - 1)}
          >
            {tx("previousPage")}
          </button>
          <div className="page-numbers">
            {numbers.map((number, index) => (
              <React.Fragment key={number}>
                {index > 0 && number - numbers[index - 1] > 1 && (
                  <span aria-hidden="true">...</span>
                )}
                <button
                  disabled={busy}
                  aria-label={tx("pageNumber").replace("{page}", number)}
                  aria-current={number === pageNumber ? "page" : undefined}
                  onClick={() => go(number)}
                >
                  {number}
                </button>
              </React.Fragment>
            ))}
          </div>
          <button
            className="pagination-direction"
            disabled={busy || !more}
            onClick={() => go(pageNumber + 1)}
          >
            {tx("nextPage")}
          </button>
        </nav>
      )}
    </section>
  );
}
function ChatPanel({ room, service, blocked, canWrite, enabled }) {
  const { tx, lang, auth } = useApp();
  const [live, setLive] = useState([]),
    [history, setHistory] = useState([]),
    [body, setBody] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(null),
    [more, setMore] = useState(false),
    [retry, setRetry] = useState(0),
    [collapsed, setCollapsed] = useState(false);
  const visible = useVisible(),
    cursor = useRef(null),
    job = useRef(null),
    lock = useRef(false),
    bottom = useRef(null),
    nearBottom = useRef(true),
    scroll = useRef(null);
  useEffect(() => {
    if (!visible || !enabled) return;
    let active = true;
    setError(null);
    const stop = service.watchMessages(
      auth.user.uid,
      room,
      (rows) => {
        if (active) {
          setLive(rows);
          if (!cursor.current) setMore(rows.length === 30);
        }
      },
      (err) => {
        if (active) setError(communityErrorKey(err));
      },
    );
    return () => {
      active = false;
      stop();
    };
  }, [room, auth.user.uid, service, visible, enabled, retry]);
  useEffect(() => {
    if (nearBottom.current)
      bottom.current?.scrollIntoView?.({ block: "nearest" });
  }, [live[0]?.id]);
  const items = [
    ...new Map([...history, ...live].map((item) => [item.id, item])).values(),
  ]
    .filter((item) => !blocked.includes(item.authorId))
    .sort(
      (a, b) =>
        (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0),
    );
  return (
    <aside
      className={"community-chat " + (collapsed ? "collapsed" : "")}
      aria-label={tx("liveChat")}
    >
      <div className="chat-heading">
        <h2>{tx(`room_${room}`)}</h2>
        <button
          aria-expanded={!collapsed}
          className="chat-collapse"
          onClick={() => setCollapsed((value) => !value)}
        >
          {tx(collapsed ? "expandChat" : "collapseChat")}
        </button>
      </div>
      <p className="chat-room-name">
        {tx(`room_${room}`)} / {tx("chatRetention")}
      </p>
      {!collapsed && (
        <>
          <div
            className="chat-scroll"
            ref={scroll}
            onScroll={() => {
              const node = scroll.current;
              nearBottom.current =
                node.scrollHeight - node.scrollTop - node.clientHeight < 80;
            }}
          >
            {more && history.length < 150 && (
              <button
                className="auth-text-link"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const result = await service.olderMessages(
                      auth.user.uid,
                      room,
                      cursor.current || live.at(-1)?.cursor,
                    );
                    setHistory((old) =>
                      [
                        ...new Map(
                          [...old, ...result.items].map((item) => [
                            item.id,
                            item,
                          ]),
                        ).values(),
                      ].slice(-150),
                    );
                    cursor.current = result.cursor;
                    setMore(result.hasMore);
                  } catch (err) {
                    setError(communityErrorKey(err));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {tx("olderMessages")}
              </button>
            )}
            {items.map((item) => (
              <article
                className={
                  "chat-message " +
                  (item.authorId === auth.profile?.userId ? "mine" : "")
                }
                key={item.id}
              >
                <Author item={item} lang={lang} tx={tx} showFlag />
                <p className="content-body">{item.body}</p>
                <ContentTools
                  item={{
                    ...item,
                    roomId: room,
                    kind: "message",
                    parentId: "",
                    contentId: item.id,
                  }}
                  own={item.authorId === auth.profile?.userId}
                  service={service}
                  blocked={false}
                  onChange={
                    item.authorId === auth.profile?.userId
                      ? () =>
                          setHistory((old) =>
                            old.filter((row) => row.id !== item.id),
                          )
                      : undefined
                  }
                />
              </article>
            ))}
            {items.length === 0 && (
              <p className="community-empty">{tx("noMessages")}</p>
            )}
            <div ref={bottom} />
          </div>
          {!enabled && <p role="status">{tx("chatPaused")}</p>}
          {!visible && <p role="status">{tx("chatInactive")}</p>}
          {error && (
            <div className="community-error" role="alert">
              <p>{tx(error)}</p>
              <button
                className="auth-text-link"
                onClick={() => setRetry((value) => value + 1)}
              >
                {tx("retry")}
              </button>
            </div>
          )}
          <form
            className="chat-compose"
            onSubmit={async (event) => {
              event.preventDefault();
              if (lock.current || !canWrite || !enabled || !body.trim()) return;
              lock.current = true;
              setBusy(true);
              setError(null);
              try {
                if (!job.current || job.current.body !== body)
                  job.current = {
                    body,
                    id: await service.newId(auth.user.uid),
                  };
                await service.publish(auth.user.uid, {
                  roomId: room,
                  kind: "message",
                  contentId: job.current.id,
                  body,
                });
                setBody("");
                job.current = null;
                nearBottom.current = true;
              } catch (err) {
                setError(communityErrorKey(err));
              } finally {
                lock.current = false;
                setBusy(false);
              }
            }}
          >
            <label className="visually-hidden" htmlFor="chat-message-input">
              {tx("messageBody")}
            </label>
            <textarea
              id="chat-message-input"
              name="messageBody"
              rows={2}
              maxLength={500}
              required
              disabled={!canWrite || !enabled || busy}
              value={body}
              placeholder={tx(
                canWrite ? "messagePlaceholder" : "writeRequirements",
              )}
              onChange={(event) => setBody(event.target.value)}
            />
            <button
              className="auth-button"
              disabled={!canWrite || !enabled || busy || !body.trim()}
            >
              {tx(busy ? "authBusy" : "sendMessage")}
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
export default function CommunitySpace({ mode = "board" }) {
  const { tx, auth, navigate, communityApi } = useApp();
  const service = communityApi || communityService;
  const isChat = mode === "chat",
    isWriting = mode === "write";
  const location = useLocation();
  const params = parseLocation(location).params;
  const selected = params.get("room") || "global",
    room = validRoom(selected) ? selected : "global",
    postId = /^[A-Za-z0-9_-]{1,128}$/.test(params.get("post") || "")
      ? params.get("post")
      : null;
  const [flags, setFlags] = useState(null),
    [blocked, setBlocked] = useState([]),
    [error, setError] = useState(null),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    setFlags(null);
    setBlocked([]);
    setError(null);
    if (!auth.user || auth.deletionPending) return;
    let active = true;
    const onError = (err) => {
      if (active) setError(communityErrorKey(err));
    };
    const stopFlags = service.watchFlags(
      auth.user.uid,
      (value) => {
        if (active) setFlags(value);
      },
      onError,
    );
    const stopBlocks = service.watchBlocks(
      auth.user.uid,
      (value) => {
        if (active) setBlocked(value);
      },
      onError,
    );
    return () => {
      active = false;
      stopFlags();
      stopBlocks();
    };
  }, [auth.user?.uid, auth.deletionPending, service, retry]);
  const canWrite =
    !!auth.user?.emailVerified &&
    identityReady(auth.profile) &&
    !auth.suspended &&
    !auth.deletionPending;
  return (
    <section
      className={`container page-section community-page ${isChat ? "chat-page" : isWriting ? "post-write-page" : "board-page"}`}
    >
      <div className="community-heading">
        <div>
          <h1>
            {tx(isChat ? "liveChat" : isWriting ? "writePost" : "community")}
          </h1>
          <p>
            {tx(
              isChat
                ? "chatIntro"
                : isWriting
                  ? "postWriteIntro"
                  : "communityIntro",
            )}
          </p>
        </div>
        {auth.isAdmin && (
          <PageLink className="auth-button secondary" page="admin">
            {tx("adminTitle")}
          </PageLink>
        )}
      </div>
      {!isWriting && (
        <nav className="room-tabs" aria-label={tx("communityRooms")}>
          {ROOM_IDS.map((id) => (
            <button
              key={id}
              className={room === id ? "active" : ""}
              aria-pressed={room === id}
              onClick={() =>
                navigate(isChat ? "chat" : "community", { room: id })
              }
            >
              {tx(`room_${id}`)}
            </button>
          ))}
        </nav>
      )}
      {!auth.user ? (
        <div className="community-gate">
          <p>{tx("communityLogin")}</p>
          <PageLink className="auth-button" page="account">
            {tx("loginSignup")}
          </PageLink>
        </div>
      ) : auth.suspended ? (
        <p className="community-error" role="alert">
          {tx("accountSuspended")}
        </p>
      ) : auth.deletionPending ? (
        <p className="community-error">{tx("authDeletionPending")}</p>
      ) : (
        <>
          {!identityReady(auth.profile) && (
            <p className="community-notice">
              {tx("identityRequired")}{" "}
              <PageLink page="account">{tx("authPreferences")}</PageLink>
            </p>
          )}
          {!auth.user.emailVerified && (
            <p className="community-notice">
              {tx("writeRequirements")}{" "}
              <PageLink page="account">{tx("authCheckVerification")}</PageLink>
            </p>
          )}
          {blocked.length > 0 && (
            <details className="blocked-users">
              <summary>
                {tx("blockedUsers")} ({blocked.length})
              </summary>
              {blocked.map((id) => (
                <button
                  className="auth-text-link"
                  key={id}
                  onClick={() =>
                    service
                      .block(auth.user.uid, id, false)
                      .catch((err) => setError(communityErrorKey(err)))
                  }
                >
                  {id} / {tx("unblock")}
                </button>
              ))}
            </details>
          )}
          {error && (
            <div role="alert" className="community-error">
              <p>{tx(error)}</p>
              <button
                className="auth-button secondary"
                onClick={() => setRetry((value) => value + 1)}
              >
                {tx("retry")}
              </button>
            </div>
          )}
          {!flags && !error && <p role="status">{tx("loading")}</p>}
          {flags && !flags.communityEnabled && (
            <p className="community-notice">{tx("communityPaused")}</p>
          )}
          {flags?.communityEnabled && (
            <div className="community-content" key={auth.user.uid}>
              {isWriting ? (
                <section className="post-editor">
                  <PageLink
                    className="auth-text-link"
                    page="community"
                    params={{ room }}
                  >
                    {tx("backToPosts")}
                  </PageLink>
                  <h2>{tx(`room_${room}`)}</h2>
                  {canWrite ? (
                    <Composer
                      kind="post"
                      room={room}
                      service={service}
                      onCancel={() => navigate("community", { room })}
                      onDone={(id) => navigate("community", { room, post: id })}
                    />
                  ) : (
                    <p className="community-notice">
                      {tx("writeRequirements")}
                    </p>
                  )}
                </section>
              ) : isChat ? (
                <ChatPanel
                  key={`chat:${room}`}
                  room={room}
                  service={service}
                  blocked={blocked}
                  canWrite={canWrite}
                  enabled={flags.chatEnabled}
                />
              ) : (
                <PostBoard
                  key={room}
                  room={room}
                  postId={postId}
                  service={service}
                  blocked={blocked}
                  canWrite={canWrite}
                />
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
