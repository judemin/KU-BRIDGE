import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "./context.jsx";
import translations from "./i18n.js";
import {
  AUDIENCES,
  CATEGORIES,
  RESOURCES,
  findTopics,
} from "./services/catalog.js";
import { getAuthState } from "./services/auth.js";
import { CHECK_ITEMS, ISSUE_CARDS, QUESTIONS } from "./config.js";
import { usePersonalState } from "./hooks/usePersonalState.js";
import { changeLocation, parseLocation, useLocation } from "./navigation.js";
import { useRevealMotion } from "./motion.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ResourceDialog from "./components/ResourceDialog.jsx";
import {
  ErrorBoundary,
  LoadingState,
  NotFoundPage,
} from "./components/States.jsx";
import "./styles.css";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ExplorePage = lazy(() => import("./pages/ExplorePage.jsx"));
const HelpPage = lazy(() => import("./pages/HelpPage.jsx"));
const ChecklistPage = lazy(() => import("./pages/ChecklistPage.jsx"));
const PAGES = {
  home: HomePage,
  explore: ExplorePage,
  saved: ExplorePage,
  help: HelpPage,
  checklist: ChecklistPage,
  notFound: NotFoundPage,
};

function MotionPage({ children, contentKey }) {
  const ref = useRef(null);
  useRevealMotion(ref, contentKey);
  return <div ref={ref}>{children}</div>;
}

export default function App() {
  const location = useLocation();
  const route = useMemo(() => parseLocation(location), [location]);
  const { page, params } = route;
  const [locale, setLocale] = usePersonalState("locale", "en", (value) =>
    ["ko", "en", "zh", "ja"].includes(value),
  );
  const lang = locale;
  const tx = (key) => translations[lang][key] || translations.en[key] || key;
  const [saved, setSaved] = usePersonalState("saved", []);
  const [checked, setChecked] = usePersonalState("checked", {});
  const [preferredAudience, setPreferredAudience] = usePersonalState(
    "audience",
    "all",
    (value) => AUDIENCES.includes(value),
  );
  const [mobileMenu, setMobileMenu] = useState(false);
  const audience = AUDIENCES.includes(params.get("student"))
    ? params.get("student")
    : "all";
  const category = CATEGORIES.includes(params.get("category"))
    ? params.get("category")
    : "all";
  const query = params.get("q") || "";
  const issue = ISSUE_CARDS.find(
    (item) => item.id === params.get("issue") && item.action === "explore",
  );
  const recommend = issue?.resources || null;
  const selected = RESOURCES.some((item) => item.id === params.get("detail"))
    ? params.get("detail")
    : null;
  const checkAudience =
    audience !== "all"
      ? audience
      : preferredAudience !== "all"
        ? preferredAudience
        : "u";
  const currentChecks = CHECK_ITEMS[checkAudience];
  const completion = currentChecks.filter(
    (key) => checked[checkAudience + ":" + key],
  ).length;
  const helpAudience = audience !== "all" ? audience : "u";
  const helpQuestion = QUESTIONS.includes(params.get("topic"))
    ? params.get("topic")
    : "askGrad";
  const list = useMemo(
    () =>
      findTopics({
        page,
        audience,
        category,
        recommend,
        query,
        saved,
        lang,
        tx,
      }),
    [page, audience, category, issue, query, saved, lang],
  );
  const Page = PAGES[page];

  function updateParams(changes) {
    const current = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      )
        current.delete(key);
      else current.set(key, String(value));
    }
    changeLocation(page, Object.fromEntries(current), { replace: true });
  }
  function navigate(to, values = {}) {
    setMobileMenu(false);
    changeLocation(to, values);
  }
  function setAudience(value) {
    setPreferredAudience(value);
    updateParams({ student: value });
  }
  function chooseIssue(item) {
    navigate(item.action, item.action === "explore" ? { issue: item.id } : {});
  }
  function toggleSaved(id) {
    setSaved((old) =>
      old.includes(id) ? old.filter((item) => item !== id) : [...old, id],
    );
  }
  function toggleCheck(key) {
    setChecked((old) => ({
      ...old,
      [checkAudience + ":" + key]: !old[checkAudience + ":" + key],
    }));
  }

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    const label = {
      home: "brand",
      explore: "sectionExplore",
      help: "askTitle",
      checklist: "checkTitle",
      saved: "navSaved",
      notFound: "notFoundTitle",
    }[page];
    document.title = "KU Bridge — " + tx(label);
  }, [lang, page]);
  useEffect(() => {
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route.pathname]);

  const value = {
    tx,
    lang,
    page,
    locale,
    setLocale,
    navigate,
    audience,
    setAudience,
    category,
    setCategory: (value) => updateParams({ category: value }),
    query,
    setQuery: (value) => updateParams({ q: value }),
    recommend,
    setRecommend: () => updateParams({ issue: null }),
    list,
    saved,
    toggleSaved,
    checked,
    setChecked,
    toggleCheck,
    selected,
    setSelected: (value) => updateParams({ detail: value }),
    mobileMenu,
    setMobileMenu,
    chooseIssue,
    helpAudience,
    setHelpAudience: (value) => updateParams({ student: value }),
    helpQuestion,
    setHelpQuestion: (value) => updateParams({ topic: value }),
    checkAudience,
    currentChecks,
    completion,
    clearFilters: () => changeLocation(page, {}, { replace: true }),
    auth: getAuthState(),
  };
  return (
    <AppContext.Provider value={value}>
      <div className="app-shell">
        <div className="topline" />
        <Header />
        <a className="skip-link" href="#main-content">
          {tx("skipContent")}
        </a>
        <main id="main-content" key={page}>
          <ErrorBoundary
            key={page}
            tx={tx}
            onRetry={() => window.location.reload()}
          >
            <Suspense fallback={<LoadingState tx={tx} />}>
              <MotionPage
                contentKey={
                  page +
                  ":" +
                  checkAudience +
                  ":" +
                  list.map((item) => item.id).join(",")
                }
              >
                <Page />
              </MotionPage>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <ResourceDialog />
      </div>
    </AppContext.Provider>
  );
}
