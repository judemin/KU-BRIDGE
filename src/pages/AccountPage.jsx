import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context.jsx";
import { authErrorKey } from "../services/auth.js";
import { communityService } from "../services/community.js";
import PageLink from "../components/PageLink.jsx";
import { useLocation, parseLocation } from "../navigation.js";
import {
  COUNTRY_CODES,
  ROOM_IDS,
  countryName,
  normalizeUserId,
  validUserId,
  validRoom,
  roomForCountry,
} from "../communityConfig.js";

function Preferences({ value, onChange, tx, lang, lockedId = false }) {
  const change = (key) => (event) =>
    onChange({ ...value, [key]: event.target.value });
  return (
    <div className="account-preferences">
      <label>
        {tx("userId")}
        <input
          name="userId"
          autoComplete="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z][a-zA-Z0-9_]{2,19}"
          readOnly={lockedId}
          value={value.userId || ""}
          onChange={change("userId")}
          aria-describedby="user-id-hint"
        />
      </label>
      <p id="user-id-hint" className="auth-hint">
        {tx(lockedId ? "userIdLocked" : "userIdHint")}
      </p>
      <label>
        {tx("nationality")}
        <select
          name="nationality"
          required
          value={value.nationality || ""}
          onChange={change("nationality")}
        >
          <option value="">{tx("chooseNationality")}</option>
          {[...COUNTRY_CODES]
            .sort((a, b) =>
              countryName(a, lang).localeCompare(countryName(b, lang)),
            )
            .map((code) => (
              <option key={code} value={code}>
                {countryName(code, lang)}
              </option>
            ))}
        </select>
      </label>
      <p className="auth-hint">{tx("publicIdentityHint")}</p>
      <label>
        {tx("locale")}
        <select name="locale" value={value.locale} onChange={change("locale")}>
          {[
            ["en", "English"],
            ["ko", "한국어"],
            ["zh", "简体中文"],
            ["ja", "日本語"],
          ].map(([code, label]) => (
            <option value={code} key={code}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        {tx("studentType")}
        <select
          name="studentType"
          value={value.studentType}
          onChange={change("studentType")}
        >
          {["all", "u", "g", "e", "l"].map((type) => (
            <option value={type} key={type}>
              {tx(type)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {tx("authRoom")}
        <select
          name="preferredRoom"
          value={value.preferredRoom}
          onChange={change("preferredRoom")}
          aria-describedby="room-hint"
        >
          <option value="global">{tx("authGlobal")}</option>
          {ROOM_IDS.filter((room) => room !== "global").map((room) => (
            <option value={room} key={room}>
              {tx(`room_${room}`)}
            </option>
          ))}
        </select>
      </label>
      <p id="room-hint" className="auth-hint">
        {tx("authRoomHint")}
      </p>
    </div>
  );
}

export default function AccountPage() {
  const {
    tx,
    lang,
    auth,
    authService,
    navigate,
    setLocale,
    communityApi,
    saved,
    checked,
  } = useApp();
  const location = useLocation();
  const requestedMode = parseLocation(location).params.get("mode");
  const mode = ["signup", "reset"].includes(requestedMode)
    ? requestedMode
    : "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [preferences, setPreferences] = useState({
    locale: lang,
    studentType: "all",
    preferredRoom: "global",
    userId: "",
    nationality: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notices, setNotices] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const lock = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setPassword("");
    setConfirmation("");
    setDeletePassword("");
    setDeleteConfirmed(false);
    setDeleteOpen(false);
  }, [auth.user?.uid, mode]);
  useEffect(() => {
    if (auth.profile)
      setPreferences({
        locale: auth.profile.locale,
        studentType: auth.profile.studentType,
        preferredRoom: validRoom(auth.profile.preferredRoom)
          ? auth.profile.preferredRoom
          : roomForCountry(auth.profile.nationality),
        userId: auth.profile.userId || "",
        nationality: auth.profile.nationality || "",
      });
    else
      setPreferences({
        locale: lang,
        studentType: "all",
        preferredRoom: "global",
        userId: "",
        nationality: "",
      });
  }, [auth.user?.uid, auth.profile]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function run(action) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotices([]);
    try {
      await action();
    } catch (failure) {
      if (mounted.current) setError(authErrorKey(failure));
    } finally {
      lock.current = false;
      if (mounted.current) {
        setBusy(false);
        setPassword("");
        setConfirmation("");
        setDeletePassword("");
      }
    }
  }
  const notice = (...keys) => {
    if (mounted.current) setNotices(keys.filter(Boolean));
  };
  function switchMode(next) {
    setError(null);
    setNotices([]);
    navigate("account", next === "login" ? {} : { mode: next });
  }
  async function submit(event) {
    event.preventDefault();
    if (mode === "signup") {
      if (!validUserId(normalizeUserId(preferences.userId))) {
        setError("userIdInvalid");
        return;
      }
      if (!COUNTRY_CODES.includes(preferences.nationality)) {
        setError("nationalityRequired");
        return;
      }
      if (password.length < 8) {
        setError("authErrorPassword");
        return;
      }
      if (password !== confirmation) {
        setError("authMismatch");
        return;
      }
      if (!acknowledged) {
        setError("authReadPrivacy");
        return;
      }
    }
    await run(async () => {
      if (mode === "reset") {
        await authService.resetPassword(email, lang);
        notice("authResetSent");
      } else if (mode === "signup") {
        const result = await authService.register({
          email,
          password,
          preferences,
        });
        notice(
          result.verificationSent
            ? "authVerificationSent"
            : result.verificationError,
          !result.profileSaved && "authProfileMissing",
        );
        if (result.verificationSent) setCooldown(60);
        navigate("home");
      } else {
        await authService.login(email, password, lang);
        navigate("home");
      }
    });
  }
  const messages = (
    <>
      <div className="auth-feedback" role="status" aria-live="polite">
        {notices.map((key) => (
          <p key={key}>{tx(key)}</p>
        ))}
      </div>
      {error && (
        <p className="auth-error" role="alert">
          {tx(error)}
        </p>
      )}
    </>
  );
  if (auth.status === "loading")
    return (
      <section className="container page-section account-page" aria-busy="true">
        <h1>{tx("authAccount")}</h1>
        <p>{tx("loading")}</p>
      </section>
    );
  if (["unconfigured", "invalid", "error"].includes(auth.status))
    return (
      <section className="container page-section account-page">
        <h1>{tx("authAccount")}</h1>
        <p>{tx("authUnavailable")}</p>
        {messages}
        {auth.status === "error" && (
          <button
            className="auth-button"
            onClick={() => run(() => authService.retry())}
            disabled={busy}
          >
            {tx("retry")}
          </button>
        )}
        <PageLink page="home">{tx("navHome")}</PageLink>
      </section>
    );
  return (
    <section className="container page-section account-page">
      <div className="account-heading">
        <h1>
          {tx(
            auth.user
              ? "authAccount"
              : mode === "signup"
                ? "authRegister"
                : mode === "reset"
                  ? "authReset"
                  : "authLogin",
          )}
        </h1>
        <p>{tx("authIntro")}</p>
      </div>
      {messages}
      {auth.user ? (
        <>
          <section className="account-panel" aria-label={tx("authAccount")}>
            <div className="account-summary">
              <span className="account-email">{auth.user.email}</span>
              <span
                className={`auth-badge ${auth.user.emailVerified ? "verified" : ""}`}
              >
                {tx(
                  auth.user.emailVerified ? "authVerified" : "authUnverified",
                )}
              </span>
            </div>
            {!auth.user.emailVerified && !auth.deletionPending && (
              <>
                <p>{tx("authVerifyIntro")}</p>
                <div className="auth-actions">
                  <button
                    className="auth-button secondary"
                    disabled={busy || cooldown > 0}
                    onClick={() =>
                      run(async () => {
                        await authService.sendVerification(lang);
                        setCooldown(60);
                        notice("authVerificationSent");
                      })
                    }
                  >
                    {tx("authSendVerification")}
                    {cooldown > 0 && ` (${cooldown})`}
                  </button>
                  <button
                    className="auth-button secondary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await authService.refresh();
                        notice(
                          authService.getSnapshot().user?.emailVerified
                            ? "authVerified"
                            : "authStillUnverified",
                        );
                      })
                    }
                  >
                    {tx("authCheckVerification")}
                  </button>
                </div>
              </>
            )}
            <button
              className="auth-text-link"
              disabled={busy}
              onClick={() => run(() => authService.logout())}
            >
              {tx("authLogout")}
            </button>
          </section>
          {auth.deletionPending ? (
            <p className="auth-error" role="alert">
              {tx("authDeletionPending")}
            </p>
          ) : (
            <section className="account-panel">
              <h2>{tx("authPreferences")}</h2>
              {auth.profileStatus === "loading" ? (
                <p>{tx("loading")}</p>
              ) : auth.profileStatus === "error" ? (
                <>
                  <p role="alert">{tx("authProfileError")}</p>
                  <button
                    className="auth-button secondary"
                    disabled={busy}
                    onClick={() => run(() => authService.refresh())}
                  >
                    {tx("authReload")}
                  </button>
                </>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void run(async () => {
                      await authService.savePreferences(preferences);
                      setLocale(preferences.locale);
                      notice("authSaved");
                    });
                  }}
                >
                  <fieldset disabled={busy}>
                    {auth.profileStatus === "missing" && (
                      <p>{tx("authProfileMissing")}</p>
                    )}
                    <Preferences
                      value={preferences}
                      lockedId={!!auth.profile?.userId}
                      onChange={setPreferences}
                      tx={tx}
                      lang={lang}
                    />
                    <button className="auth-button" type="submit">
                      {tx(busy ? "authBusy" : "authSave")}
                    </button>
                  </fieldset>
                </form>
              )}
            </section>
          )}
          <section className="account-panel account-records">
            <h2>{tx("accountRecordsTitle")}</h2>
            <p>{tx("authLocalRecords")}</p>
            <div className="account-record-actions">
              {!auth.deletionPending && (
                <button
                  className="auth-button secondary"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const uid = auth.user.uid;
                      const content = await (
                        communityApi || communityService
                      ).exportOwn(uid);
                      if (authService.getSnapshot().user?.uid !== uid) return;
                      const data = {
                        exportedAt: new Date().toISOString(),
                        profile: auth.profile,
                        saved,
                        checked,
                        content,
                      };
                      const url = URL.createObjectURL(
                        new Blob([JSON.stringify(data, null, 2)], {
                          type: "application/json",
                        }),
                      );
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "ku-bridge-my-data.json";
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      notice("exportDone");
                    })
                  }
                >
                  {tx("exportData")}
                </button>
              )}

              <PageLink page="privacy" className="auth-button secondary">
                {tx("authPrivacy")}
              </PageLink>
            </div>
          </section>
          {auth.isAdmin && (
            <section className="account-panel account-admin">
              <div>
                <h2>{tx("adminTitle")}</h2>
                <p>{tx("adminAccountHint")}</p>
              </div>
              <PageLink page="admin" className="auth-button secondary">
                {tx("openAdmin")}
              </PageLink>
            </section>
          )}
          <section className="account-panel account-danger">
            <h2>{tx("accountCloseTitle")}</h2>
            <p>{tx("authDeleteIntro")}</p>
            {deleteOpen || auth.deletionPending ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!deleteConfirmed) return;
                  void run(async () => {
                    try {
                      await authService.deleteAccount(deletePassword);
                      notice("authDeleted");
                    } catch (failure) {
                      if (authService.getSnapshot().deletionPending)
                        notice("authDeleteFailure");
                      throw failure;
                    }
                  });
                }}
              >
                <fieldset disabled={busy}>
                  <label>
                    {tx("authPassword")}
                    <input
                      name="deletePassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={deletePassword}
                      onChange={(event) =>
                        setDeletePassword(event.target.value)
                      }
                    />
                  </label>
                  <label className="auth-checkbox">
                    <input
                      type="checkbox"
                      required
                      checked={deleteConfirmed}
                      onChange={(event) =>
                        setDeleteConfirmed(event.target.checked)
                      }
                    />
                    <span>{tx("authDeleteConfirm")}</span>
                  </label>
                  <div className="auth-actions">
                    <button className="auth-button danger" type="submit">
                      {tx(busy ? "authBusy" : "authDeleteAction")}
                    </button>
                    {!auth.deletionPending && (
                      <button
                        className="auth-button secondary"
                        type="button"
                        onClick={() => {
                          setDeleteOpen(false);
                          setDeletePassword("");
                          setDeleteConfirmed(false);
                        }}
                      >
                        {tx("authCancel")}
                      </button>
                    )}
                  </div>
                </fieldset>
              </form>
            ) : (
              <button
                className="auth-button danger-outline"
                disabled={busy}
                onClick={() => setDeleteOpen(true)}
              >
                {tx("authDelete")}
              </button>
            )}
          </section>
        </>
      ) : (
        <section className="account-panel">
          <div className="auth-mode-links">
            <button
              className={mode === "login" ? "active" : ""}
              disabled={busy}
              onClick={() => switchMode("login")}
            >
              {tx("authLogin")}
            </button>
            <button
              className={mode === "signup" ? "active" : ""}
              disabled={busy}
              onClick={() => switchMode("signup")}
            >
              {tx("authRegister")}
            </button>
          </div>
          {mode === "reset" && <p>{tx("authResetIntro")}</p>}
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              <label>
                {tx("authEmail")}
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              {mode !== "reset" && (
                <label>
                  {tx("authPassword")}
                  <input
                    name="password"
                    type="password"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    minLength={mode === "signup" ? 8 : undefined}
                    maxLength={4096}
                    required
                    value={password}
                    aria-describedby={
                      mode === "signup" ? "password-hint" : undefined
                    }
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
              )}
              {mode === "signup" && (
                <>
                  <p className="auth-hint" id="password-hint">
                    {tx("authPasswordHint")}
                  </p>
                  <label>
                    {tx("authConfirmPassword")}
                    <input
                      name="confirmation"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                    />
                  </label>
                  <Preferences
                    value={preferences}
                    onChange={setPreferences}
                    tx={tx}
                    lang={lang}
                  />
                  <PageLink page="privacy" target="_blank" rel="noopener">
                    {tx("authPrivacy")}
                  </PageLink>
                  <label className="auth-checkbox">
                    <input
                      type="checkbox"
                      required
                      checked={acknowledged}
                      onChange={(event) =>
                        setAcknowledged(event.target.checked)
                      }
                    />
                    <span>{tx("authAcknowledge")}</span>
                  </label>
                </>
              )}
              <button className="auth-button" type="submit">
                {tx(
                  busy
                    ? "authBusy"
                    : mode === "signup"
                      ? "authRegister"
                      : mode === "reset"
                        ? "authSendReset"
                        : "authLogin",
                )}
              </button>
            </fieldset>
          </form>
          {mode === "login" && (
            <button
              className="auth-text-link"
              disabled={busy}
              onClick={() => switchMode("reset")}
            >
              {tx("authReset")}
            </button>
          )}
        </section>
      )}
    </section>
  );
}
