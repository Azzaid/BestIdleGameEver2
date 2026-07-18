import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {Provider} from "react-redux";
import {store} from "./store";
import { ThemeProvider } from './theme/ThemeProvider'
import * as appTheme from './App.css.ts'
import {AppErrorBoundary} from "./components/AppErrorBoundary.tsx";

import CityPage from './pages/City/CityPage'
import {UpkeepBar} from "./components/UpkeepBar.tsx";
import {useTypedDispatch, useTypedSelector} from "./store/hooks.ts";
import {selectIsDebugModeEnabled} from "./store/debug/selectors.ts";
import {toggleDebugMode} from "./store/debug/slice.ts";
import { NotificationCenter } from "./components/Notifications/NotificationCenter.tsx";
import { useResearchAutoUnlock } from "./pages/Research/useResearchAutoUnlock.ts";
import {useContentAutoUnlock} from "./hooks/useContentAutoUnlock.ts";
import {useGlobalEventSignals} from "./components/GlobalEvents/useGlobalEventSignals.ts";
import {VictoryEventOverlay} from "./components/GlobalEvents/VictoryEventOverlay.tsx";
import {CityWorldUnderlay} from "./pages/City/CityWorldUnderlay.tsx";
import {CityCanvasInteractionProvider} from "./pages/City/cityCanvasInteraction.tsx";
import type {HexCell} from "./models/city/HexGrid.ts";
import type {CityExpansionSideId} from "./models/city/expansion.ts";
import ResearchModal from "./pages/Research/ResearchModal.tsx";

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
  const [selectedCityHex, setSelectedCityHex] = useState<HexCell | null>(null);
  const [confirmingCityExpansionSide, setConfirmingCityExpansionSide] = useState<CityExpansionSideId | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
  const isLocalDebugAvailable = import.meta.env.DEV;
  const cityCanvasInteraction = {
    selectedHex: selectedCityHex,
    setSelectedHex: setSelectedCityHex,
    confirmingExpansionSide: confirmingCityExpansionSide,
    setConfirmingExpansionSide: setConfirmingCityExpansionSide,
  };
  const cityCanvasIsInteractive = true;
  const cityWorldOverlayIsVisible = true;
  const cityWorldTopInsetPx = useRouteChromeTopInsetPx(appContainerRef, routeChromeRef, location.pathname);
  const openHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(true);
    if (location.pathname !== "/") {
      navigate("/");
    }
  }, [location.pathname, navigate]);
  const openResearchModal = useCallback(() => {
    setIsResearchModalOpen(true);
    if (location.pathname !== "/") {
      navigate("/");
    }
  }, [location.pathname, navigate]);

  useResearchAutoUnlock();
  useContentAutoUnlock();
  useGlobalEventSignals({openHistory: openHistoryModal});

  const renderScrollableRoute = (children: ReactNode, options?: {worldOverlay?: boolean}) => (
      <main
          ref={contentRef}
          className={`${appTheme.appContent} ${options?.worldOverlay ? appTheme.appContentWorldOverlay : ""}`}
      >
          {children}
      </main>
  );

  return (
      <CityCanvasInteractionProvider value={cityCanvasInteraction}>
              <div ref={appContainerRef} className={appTheme.appContainer}>
                  <CityWorldUnderlay
                      interactive={cityCanvasIsInteractive}
                      topInsetPx={cityWorldTopInsetPx}
                  />
                  <NotificationCenter />
                  <VictoryEventOverlay onOpenHistory={openHistoryModal} />
                  <div className={`${appTheme.appRouteLayer} ${cityWorldOverlayIsVisible ? appTheme.appRouteLayerWorldOverlay : ""}`}>
                      <Routes>
                          <Route
                              path="/"
                              element={(
                                  <UpkeepBarRouteFrame chromeRef={routeChromeRef}>
                                      {renderScrollableRoute(
                                          <CityPage
                                              isHistoryOpen={isHistoryModalOpen}
                                              onHistoryOpen={openHistoryModal}
                                              onHistoryClose={() => setIsHistoryModalOpen(false)}
                                              onResearchOpen={openResearchModal}
                                              routeChromeTopInsetPx={cityWorldTopInsetPx}
                                          />,
                                          {worldOverlay: true},
                                      )}
                                  </UpkeepBarRouteFrame>
                              )}
                          />
                          <Route path="/build" element={<Navigate to="/" replace />} />
                          <Route
                              path="/research"
                              element={<OpenResearchRoute onOpenResearch={openResearchModal} />}
                          />
                          <Route path="/city" element={<Navigate to="/" replace />} />
                          <Route path="/history" element={<Navigate to="/" replace />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                  </div>
                  {isLocalDebugAvailable && (
                      <label className={appTheme.floatingDebugToggle}>
                          <input
                              type="checkbox"
                              checked={isDebugModeEnabled}
                              onChange={() => dispatch(toggleDebugMode())}
                          />
                          Debug
                      </label>
                  )}
                  {isResearchModalOpen && (
                      <ResearchModal
                          onClose={() => setIsResearchModalOpen(false)}
                          topInsetPx={cityWorldTopInsetPx}
                      />
                  )}
              </div>
      </CityCanvasInteractionProvider>
  )
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
  const devFallbackPath = DevShell ? "/dev/progression" : "/";

  return (
      <Routes>
          <Route
              path="/dev/*"
              element={DevShell ? (
                      <Suspense fallback={null}>
                          <DevShell enabled={devToolsEnabled} />
                      </Suspense>
                  ) : <Navigate to="/" replace />}
          />
          <Route path="/progression" element={<Navigate to={devFallbackPath} replace />} />
          <Route path="/ids" element={<Navigate to={DevShell ? "/dev/ids" : "/"} replace />} />
          <Route path="/entity-create/*" element={<Navigate to={DevShell ? "/dev/entity-create/new" : "/"} replace />} />
          <Route path="/content-plan" element={<Navigate to={DevShell ? "/dev/content-plan" : "/"} replace />} />
          <Route path="/monster-edit/*" element={<Navigate to={DevShell ? "/dev/monster-edit/new" : "/"} replace />} />
          <Route path="/enemy-animation-sprites" element={<Navigate to={DevShell ? "/dev/enemy-animation-sprites" : "/"} replace />} />
          <Route path="/gun-part-editor" element={<Navigate to={DevShell ? "/dev/gun-part-editor" : "/"} replace />} />
          <Route path="/global-events" element={<Navigate to={DevShell ? "/dev/global-events" : "/"} replace />} />
          <Route path="/homogeneous-values" element={<Navigate to={DevShell ? "/dev/homogeneous-values" : "/"} replace />} />
          <Route path="/hex-background-editor" element={<Navigate to={DevShell ? "/dev/hex-background-editor" : "/"} replace />} />
          <Route path="/hex-background-lab" element={<Navigate to={DevShell ? "/dev/hex-background-lab" : "/"} replace />} />
          <Route path="/damage-area-vfx" element={<Navigate to={DevShell ? "/dev/damage-area-vfx" : "/"} replace />} />
          <Route path="/*" element={<GameShell />} />
      </Routes>
  );
}

function OpenResearchRoute({onOpenResearch}: {onOpenResearch: () => void}) {
  useEffect(() => {
    onOpenResearch();
  }, [onOpenResearch]);

  return <Navigate to="/" replace />;
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
