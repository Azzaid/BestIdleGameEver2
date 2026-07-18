import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject, type TouchEvent, type UIEvent, type WheelEvent } from 'react'
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {Provider} from "react-redux";
import {store} from "./store";
import { ThemeProvider } from './theme/ThemeProvider'
import * as appTheme from './App.css.ts'
import {AppErrorBoundary} from "./components/AppErrorBoundary.tsx";

import ResearchPage from './pages/Research/ResearchPage'
import CityPage from './pages/City/CityPage'
import HudLabPage from './pages/HudLab/HudLabPage.tsx'
import {UpkeepBar} from "./components/UpkeepBar.tsx";
import {useTypedDispatch, useTypedSelector} from "./store/hooks.ts";
import {selectIsDebugModeEnabled} from "./store/debug/selectors.ts";
import {toggleDebugMode} from "./store/debug/slice.ts";
import { NotificationCenter } from "./components/Notifications/NotificationCenter.tsx";
import { useResearchAutoUnlock } from "./pages/Research/useResearchAutoUnlock.ts";
import {CityExpansionControl} from "./components/CityExpansionControl.tsx";
import {useContentAutoUnlock} from "./hooks/useContentAutoUnlock.ts";
import {useGlobalEventSignals} from "./components/GlobalEvents/useGlobalEventSignals.ts";
import {VictoryEventOverlay} from "./components/GlobalEvents/VictoryEventOverlay.tsx";
import {CityWorldUnderlay} from "./pages/City/CityWorldUnderlay.tsx";
import {CityCanvasInteractionProvider} from "./pages/City/cityCanvasInteraction.tsx";
import type {HexCell} from "./models/city/HexGrid.ts";
import type {CityExpansionSideId} from "./models/city/expansion.ts";

const DevShell = import.meta.env.DEV
    ? lazy(() => import("./devtools/DevShell.tsx"))
    : null;

function GameShell() {
  const dispatch = useTypedDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const appContainerRef = useRef<HTMLDivElement | null>(null);
  const routeChromeRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const lastTouchYRef = useRef<number | null>(null);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [selectedCityHex, setSelectedCityHex] = useState<HexCell | null>(null);
  const [confirmingCityExpansionSide, setConfirmingCityExpansionSide] = useState<CityExpansionSideId | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
  const isLocalDebugAvailable = import.meta.env.DEV;
  const isDebugToolsEnabled = isLocalDebugAvailable && isDebugModeEnabled;
  const cityCanvasInteraction = {
    selectedHex: selectedCityHex,
    setSelectedHex: setSelectedCityHex,
    confirmingExpansionSide: confirmingCityExpansionSide,
    setConfirmingExpansionSide: setConfirmingCityExpansionSide,
  };
  const cityCanvasIsInteractive = location.pathname === "/city" || location.pathname === "/";
  const cityWorldOverlayIsVisible = cityCanvasIsInteractive || location.pathname === "/hud-lab";
  const cityWorldTopInsetPx = useRouteChromeTopInsetPx(appContainerRef, routeChromeRef, location.pathname);
  const openHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(true);
    if (location.pathname !== "/city" && location.pathname !== "/") {
      navigate("/city");
    }
  }, [location.pathname, navigate]);

  useResearchAutoUnlock();
  useContentAutoUnlock();
  useGlobalEventSignals({openHistory: openHistoryModal});

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
  }, [location.pathname]);

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

  const renderScrollableRoute = (children: ReactNode, options?: {worldOverlay?: boolean}) => (
      <main
          ref={contentRef}
          className={`${appTheme.appContent} ${options?.worldOverlay ? appTheme.appContentWorldOverlay : ""}`}
          onScroll={handleContentScroll}
          onWheel={handleContentWheel}
          onTouchStart={handleContentTouchStart}
          onTouchMove={handleContentTouchMove}
      >
          {children}
      </main>
  );

  return (
      <CityCanvasInteractionProvider value={cityCanvasInteraction}>
              <div ref={appContainerRef} className={appTheme.appContainer}>
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
                          <li>
                              <Link className={appTheme.navBarLink} to="/research">Research</Link>
                          </li>
                          <li>
                              <Link className={appTheme.navBarLink} to="/city">City</Link>
                          </li>
                          {isDebugToolsEnabled && (
                              <li>
                                  <Link className={appTheme.navBarLink} to="/dev">Dev</Link>
                              </li>
                          )}
                      </ul>
                      <div className={appTheme.themeSwitcher}>
                        {/*<ThemeSwitcher />*/}
                      </div>
                  </nav>
                  <CityWorldUnderlay
                      interactive={cityCanvasIsInteractive}
                      topInsetPx={cityWorldTopInsetPx}
                  />
                  <NotificationCenter />
                  <VictoryEventOverlay onOpenHistory={openHistoryModal} />
                  <div className={`${appTheme.appRouteLayer} ${cityWorldOverlayIsVisible ? appTheme.appRouteLayerWorldOverlay : ""}`}>
                      <Routes>
                          <Route path="/" element={<Navigate to="/city" replace />} />
                          <Route path="/build" element={<Navigate to="/city" replace />} />
                          <Route
                              path="/research"
                              element={(
                                  <UpkeepBarRouteFrame chromeRef={routeChromeRef}>
                                      {renderScrollableRoute(<ResearchPage />)}
                                  </UpkeepBarRouteFrame>
                              )}
                          />
                          <Route
                              path="/city"
                              element={(
                                  <UpkeepBarRouteFrame chromeRef={routeChromeRef} rightSlot={<CityExpansionControl />}>
                                      {renderScrollableRoute(
                                          <CityPage
                                              isHistoryOpen={isHistoryModalOpen}
                                              onHistoryOpen={openHistoryModal}
                                              onHistoryClose={() => setIsHistoryModalOpen(false)}
                                              routeChromeTopInsetPx={cityWorldTopInsetPx}
                                          />,
                                          {worldOverlay: true},
                                      )}
                                  </UpkeepBarRouteFrame>
                              )}
                          />
                          <Route path="/history" element={<Navigate to="/city" replace />} />
                          <Route path="/hud-lab" element={<UpkeepBarRouteFrame chromeRef={routeChromeRef}>{renderScrollableRoute(<HudLabPage />, {worldOverlay: true})}</UpkeepBarRouteFrame>} />
                          <Route path="*" element={<Navigate to="/city" replace />} />
                      </Routes>
                  </div>
              </div>
      </CityCanvasInteractionProvider>
  )
}

function hasVerticalOverflow(element: HTMLElement) {
  return element.scrollHeight - element.clientHeight > 1;
}

function useRouteChromeTopInsetPx(
  containerRef: RefObject<HTMLDivElement | null>,
  routeChromeRef: RefObject<HTMLDivElement | null>,
  routeKey: string,
) {
  const [topInsetPx, setTopInsetPx] = useState(0);

  useEffect(() => {
    let animationFrame: number | null = null;

    const updateTopInset = () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        animationFrame = null;
        const container = containerRef.current;
        const routeChrome = routeChromeRef.current;

        if (!container || !routeChrome) {
          setTopInsetPx(0);
          return;
        }

        const containerRect = container.getBoundingClientRect();
        const chromeRect = routeChrome.getBoundingClientRect();
        const nextTopInsetPx = Math.max(0, chromeRect.bottom - containerRect.top);

        setTopInsetPx(current => (
          Math.abs(current - nextTopInsetPx) < 0.5 ? current : nextTopInsetPx
        ));
      });
    };

    updateTopInset();

    const resizeObserver = new ResizeObserver(updateTopInset);
    const container = containerRef.current;
    const routeChrome = routeChromeRef.current;
    if (container) resizeObserver.observe(container);
    if (routeChrome) resizeObserver.observe(routeChrome);
    window.addEventListener("resize", updateTopInset);

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTopInset);
    };
  }, [containerRef, routeChromeRef, routeKey]);

  return topInsetPx;
}

function App() {
  return (
      <ThemeProvider initialTheme={'tech'}>
          <AppErrorBoundary>
              <Router>
                  <AppRoutes />
              </Router>
          </AppErrorBoundary>
      </ThemeProvider>
  )
}

function AppRoutes() {
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
  const devToolsEnabled = import.meta.env.DEV && isDebugModeEnabled;
  const devFallbackPath = DevShell ? "/dev/progression" : "/city";

  return (
      <Routes>
          <Route
              path="/dev/*"
              element={DevShell ? (
                      <Suspense fallback={null}>
                          <DevShell enabled={devToolsEnabled} />
                      </Suspense>
                  ) : <Navigate to="/city" replace />}
          />
          <Route path="/progression" element={<Navigate to={devFallbackPath} replace />} />
          <Route path="/ids" element={<Navigate to={DevShell ? "/dev/ids" : "/city"} replace />} />
          <Route path="/entity-create/*" element={<Navigate to={DevShell ? "/dev/entity-create/new" : "/city"} replace />} />
          <Route path="/content-plan" element={<Navigate to={DevShell ? "/dev/content-plan" : "/city"} replace />} />
          <Route path="/monster-edit/*" element={<Navigate to={DevShell ? "/dev/monster-edit/new" : "/city"} replace />} />
          <Route path="/enemy-animation-sprites" element={<Navigate to={DevShell ? "/dev/enemy-animation-sprites" : "/city"} replace />} />
          <Route path="/gun-part-editor" element={<Navigate to={DevShell ? "/dev/gun-part-editor" : "/city"} replace />} />
          <Route path="/global-events" element={<Navigate to={DevShell ? "/dev/global-events" : "/city"} replace />} />
          <Route path="/homogeneous-values" element={<Navigate to={DevShell ? "/dev/homogeneous-values" : "/city"} replace />} />
          <Route path="/hex-background-editor" element={<Navigate to={DevShell ? "/dev/hex-background-editor" : "/city"} replace />} />
          <Route path="/hex-background-lab" element={<Navigate to={DevShell ? "/dev/hex-background-lab" : "/city"} replace />} />
          <Route path="/damage-area-vfx" element={<Navigate to={DevShell ? "/dev/damage-area-vfx" : "/city"} replace />} />
          <Route path="/*" element={<GameShell />} />
      </Routes>
  );
}

function AppWithProviders() {
  return (
      <Provider store={store}>
          <App />
      </Provider>
  )
}

function UpkeepBarRouteFrame({
  children,
  chromeRef,
  rightSlot,
}: {
  children: ReactNode;
  chromeRef?: RefObject<HTMLDivElement | null>;
  rightSlot?: ReactNode;
}) {
  return (
      <>
          <div ref={chromeRef} className={appTheme.routeChrome}>
              <UpkeepBar rightSlot={rightSlot} />
          </div>
          {children}
      </>
  );
}

export default AppWithProviders
