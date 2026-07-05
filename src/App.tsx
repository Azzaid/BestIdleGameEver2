import { lazy, Suspense, useEffect, useRef, useState, type TouchEvent, type UIEvent, type WheelEvent } from 'react'
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import {Provider} from "react-redux";
import {store} from "./store";
import { ThemeProvider } from './theme/ThemeProvider'
import * as appTheme from './App.css.ts'

// Import page components
import BattlePage from './pages/Battle/BattlePage'
import BuildPage from './pages/Build/BuildPage'
import ResearchPage from './pages/Research/ResearchPage'
import CityPage from './pages/City/CityPage'
import HistoryPage from './pages/History/HistoryPage.tsx'
import {UpkeepBar} from "./components/UpkeepBar.tsx";
import {useTypedDispatch, useTypedSelector} from "./store/hooks.ts";
import {selectCitySignatureStatus} from "./store/upkeep/selectors.ts";
import {selectHasAnyTowerBuild} from "./store/towers/selectors.ts";
import {selectIsDebugModeEnabled} from "./store/debug/selectors.ts";
import {toggleDebugMode} from "./store/debug/slice.ts";
import { NotificationCenter } from "./components/Notifications/NotificationCenter.tsx";
import { useResearchAutoUnlock } from "./pages/Research/useResearchAutoUnlock.ts";
import {CityExpansionControl} from "./components/CityExpansionControl.tsx";
import {useContentAutoUnlock} from "./hooks/useContentAutoUnlock.ts";
import {useGlobalEventSignals} from "./components/GlobalEvents/useGlobalEventSignals.ts";
import {selectUnseenHistoryEntryIds} from "./store/globalEvents/selectors.ts";
import {VictoryEventOverlay} from "./components/GlobalEvents/VictoryEventOverlay.tsx";

const DevToolsNavLinks = import.meta.env.DEV
    ? lazy(() => import("./devtools/DevToolsNavLinks.tsx"))
    : null;

const DevToolsRouteGate = import.meta.env.DEV
    ? lazy(() => import("./devtools/DevToolsRouteGate.tsx"))
    : null;

function AppFrame() {
  const dispatch = useTypedDispatch();
  const location = useLocation();
  const contentRef = useRef<HTMLElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const lastTouchYRef = useRef<number | null>(null);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const signatureStatus = useTypedSelector(selectCitySignatureStatus);
  const hasAnyTowerBuild = useTypedSelector(selectHasAnyTowerBuild);
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
  const unseenHistoryEntryCount = useTypedSelector(selectUnseenHistoryEntryIds).length;
  const isLocalDebugAvailable = import.meta.env.DEV;
  const isDebugToolsEnabled = isLocalDebugAvailable && isDebugModeEnabled;
  const isBuildBlocked = signatureStatus.isBesieged && hasAnyTowerBuild;
  const shouldShowUpkeepBar = location.pathname !== "/" && location.pathname !== "/battle";
  const shouldShowCityExpansionControl = location.pathname === "/city";

  useResearchAutoUnlock();
  useContentAutoUnlock();
  useGlobalEventSignals();

  useEffect(() => {
    setIsNavHidden(false);
    lastScrollTopRef.current = contentRef.current?.scrollTop ?? 0;
  }, [location.pathname]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const showNavWhenContentDoesNotScroll = () => {
      if (!hasVerticalOverflow(contentElement)) {
        setIsNavHidden(false);
      }
    };

    showNavWhenContentDoesNotScroll();

    const resizeObserver = new ResizeObserver(showNavWhenContentDoesNotScroll);
    resizeObserver.observe(contentElement);
    window.addEventListener("resize", showNavWhenContentDoesNotScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", showNavWhenContentDoesNotScroll);
    };
  }, []);

  const updateNavForDirection = (deltaY: number, currentScrollTop = contentRef.current?.scrollTop ?? 0) => {
    const contentElement = contentRef.current;
    if (!contentElement || !hasVerticalOverflow(contentElement)) {
      setIsNavHidden(false);
      return;
    }

    if (currentScrollTop <= 12 && deltaY <= 0) {
      setIsNavHidden(false);
      return;
    }

    if (deltaY > 6) {
      setIsNavHidden(true);
    } else if (deltaY < -1) {
      setIsNavHidden(false);
    }
  };

  const handleContentScroll = (event: UIEvent<HTMLElement>) => {
    const currentScrollTop = event.currentTarget.scrollTop;
    const previousScrollTop = lastScrollTopRef.current;
    const scrollDelta = currentScrollTop - previousScrollTop;

    updateNavForDirection(scrollDelta, currentScrollTop);
    lastScrollTopRef.current = currentScrollTop;
  };

  const handleContentWheel = (event: WheelEvent<HTMLElement>) => {
    const target = event.target;
    if (
      event.defaultPrevented
      || (target instanceof Element && target.closest('[data-nav-scroll-ignore="true"]'))
    ) {
      return;
    }

    updateNavForDirection(event.deltaY);
  };

  const handleContentTouchStart = (event: TouchEvent<HTMLElement>) => {
    lastTouchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleContentTouchMove = (event: TouchEvent<HTMLElement>) => {
    const currentTouchY = event.touches[0]?.clientY;
    const previousTouchY = lastTouchYRef.current;

    if (currentTouchY === undefined || previousTouchY === null) return;

    updateNavForDirection(previousTouchY - currentTouchY);
    lastTouchYRef.current = currentTouchY;
  };

  return (
              <div className={appTheme.appContainer}>
                  <nav className={`${appTheme.appNav} ${isNavHidden ? appTheme.appNavHidden : ""}`}>
                      <div className={appTheme.navLeft}>
                          {isLocalDebugAvailable && (
                              <label className={appTheme.debugToggle}>
                                  <input
                                      type="checkbox"
                                      checked={isDebugModeEnabled}
                                      onChange={() => dispatch(toggleDebugMode())}
                                  />
                                  Debug
                              </label>
                          )}
                          <div className={appTheme.appTitle}>Tower Defense Idle</div>
                      </div>
                      <ul className={appTheme.navLinks}>
                          <li className={appTheme.navBarItem}>
                              <Link className={appTheme.navBarLink} to="/battle">Battle</Link>
                          </li>
                          <li>
                              <Link className={isBuildBlocked ? appTheme.navBarLinkBlocked : appTheme.navBarLink} to="/build">Tower</Link>
                          </li>
                          <li>
                              <Link className={signatureStatus.isBesieged ? appTheme.navBarLinkBlocked : appTheme.navBarLink} to="/research">Research</Link>
                          </li>
                          <li>
                              <Link className={appTheme.navBarLink} to="/city">City</Link>
                          </li>
                          <li>
                              <Link className={appTheme.navBarLink} to="/history">
                                  <span>History</span>
                                  {unseenHistoryEntryCount > 0 && (
                                      <span
                                          className={appTheme.historyNewMarker}
                                          aria-label={`${unseenHistoryEntryCount} new history entries`}
                                          title={`${unseenHistoryEntryCount} new history entries`}
                                      />
                                  )}
                              </Link>
                          </li>
                          {isDebugToolsEnabled && DevToolsNavLinks && (
                              <Suspense fallback={null}>
                                  <DevToolsNavLinks />
                              </Suspense>
                          )}
                      </ul>
                      <div className={appTheme.themeSwitcher}>
                        {/*<ThemeSwitcher />*/}
                      </div>
                  </nav>
                  <NotificationCenter />
                  <VictoryEventOverlay />
                  {shouldShowUpkeepBar && (
                      <UpkeepBar rightSlot={shouldShowCityExpansionControl ? <CityExpansionControl /> : undefined}/>
                  )}
                  <main
                      ref={contentRef}
                      className={appTheme.appContent}
                      onScroll={handleContentScroll}
                      onWheel={handleContentWheel}
                      onTouchStart={handleContentTouchStart}
                      onTouchMove={handleContentTouchMove}
                  >
                      <Routes>
                          <Route path="/" element={<BattlePage />} />
                          <Route path="/battle" element={<BattlePage />} />
                          <Route path="/build" element={isBuildBlocked ? <BlockedPage title="Build Blocked" /> : <BuildPage/>} />
                          <Route path="/research" element={signatureStatus.isBesieged ? <BlockedPage title="Research Blocked" /> : <ResearchPage />} />
                          <Route path="/city" element={<CityPage />} />
                          <Route path="/history" element={<HistoryPage />} />
                          {DevToolsRouteGate && (
                              <Route
                                  path="/*"
                                  element={(
                                      <Suspense fallback={null}>
                                          <DevToolsRouteGate enabled={isDebugToolsEnabled} />
                                      </Suspense>
                                  )}
                              />
                          )}
                      </Routes>
                  </main>
              </div>
  )
}

function hasVerticalOverflow(element: HTMLElement) {
  return element.scrollHeight - element.clientHeight > 1;
}

function App() {
  return (
      <ThemeProvider initialTheme={'tech'}>
          <Router>
              <AppFrame />
          </Router>
      </ThemeProvider>
  )
}

function AppWithProviders() {
  return (
      <Provider store={store}>
          <App />
      </Provider>
  )
}

function BlockedPage({title}: {title: string}) {
  return (
      <section className={appTheme.blockedPage}>
          <h1 className={appTheme.blockedTitle}>{title}</h1>
          <p className={appTheme.blockedText}>
              The city is besieged. Repel attack before starting research / building anything.
          </p>
          <Link className={appTheme.blockedLink} to="/battle">To battle!</Link>
      </section>
  )
}

export default AppWithProviders
