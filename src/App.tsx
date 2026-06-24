import { useEffect, useRef, useState, type UIEvent } from 'react'
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import {Provider} from "react-redux";
import {store} from "./store";
import { ThemeProvider } from './theme/ThemeProvider'
import * as appTheme from './App.css.ts'

// Import page components
import BattlePage from './pages/Battle/BattlePage'
import BuildPage from './pages/Build/BuildPage'
import ResearchPage from './pages/Research/ResearchPage'
import CityPage from './pages/City/CityPage'
import StatisticsPage from './pages/Statistics/StatisticsPage'
import ProgressionPage from './pages/Progression/ProgressionPage.tsx'
import GunPartEditorPage from './pages/GunPartEditor/GunPartEditorPage.tsx'
import IdAuditPage from './pages/IdAudit/IdAuditPage.tsx'
import EntityCreatePage from './pages/EntityCreate/EntityCreatePage.tsx'
import GlobalEventsEditorPage from './pages/GlobalEventsEditor/GlobalEventsEditorPage.tsx'
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
import {GlobalEventModal} from "./components/GlobalEvents/GlobalEventModal.tsx";
import {useGlobalEventSignals} from "./components/GlobalEvents/useGlobalEventSignals.ts";

function AppFrame() {
  const dispatch = useTypedDispatch();
  const location = useLocation();
  const contentRef = useRef<HTMLElement | null>(null);
  const lastScrollTopRef = useRef(0);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const signatureStatus = useTypedSelector(selectCitySignatureStatus);
  const hasAnyTowerBuild = useTypedSelector(selectHasAnyTowerBuild);
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
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

  const handleContentScroll = (event: UIEvent<HTMLElement>) => {
    const currentScrollTop = event.currentTarget.scrollTop;
    const previousScrollTop = lastScrollTopRef.current;
    const scrollDelta = currentScrollTop - previousScrollTop;

    if (currentScrollTop <= 12) {
      setIsNavHidden(false);
    } else if (scrollDelta > 6) {
      setIsNavHidden(true);
    } else if (scrollDelta < -1) {
      setIsNavHidden(false);
    }

    lastScrollTopRef.current = currentScrollTop;
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
                              <Link className={appTheme.navBarLink} to="/statistics">Statistics</Link>
                          </li>
                          {isDebugToolsEnabled && (
                              <>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/progression">Progression</Link>
                                  </li>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/ids">IDs</Link>
                                  </li>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/entity-create/new">Entity Create</Link>
                                  </li>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/gun-part-editor">Part Editor</Link>
                                  </li>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/global-events">Global Events</Link>
                                  </li>
                              </>
                          )}
                      </ul>
                      <div className={appTheme.themeSwitcher}>
                        {/*<ThemeSwitcher />*/}
                      </div>
                  </nav>
                  <NotificationCenter />
                  <GlobalEventModal />
                  {shouldShowUpkeepBar && (
                      <UpkeepBar rightSlot={shouldShowCityExpansionControl ? <CityExpansionControl /> : undefined}/>
                  )}
                  <main
                      ref={contentRef}
                      className={appTheme.appContent}
                      onScroll={handleContentScroll}
                  >
                      <Routes>
                          <Route path="/" element={<BattlePage />} />
                          <Route path="/battle" element={<BattlePage />} />
                          <Route path="/build" element={isBuildBlocked ? <BlockedPage title="Build Blocked" /> : <BuildPage/>} />
                          <Route path="/research" element={signatureStatus.isBesieged ? <BlockedPage title="Research Blocked" /> : <ResearchPage />} />
                          <Route path="/city" element={<CityPage />} />
                          <Route path="/statistics" element={<StatisticsPage />} />
                          <Route path="/progression" element={isDebugToolsEnabled ? <ProgressionPage /> : <Navigate to="/battle" replace />} />
                          <Route path="/gun-part-editor" element={isDebugToolsEnabled ? <GunPartEditorPage /> : <Navigate to="/battle" replace />} />
                          <Route path="/ids" element={isDebugToolsEnabled ? <IdAuditPage /> : <Navigate to="/battle" replace />} />
                          <Route path="/entity-create" element={<Navigate to="/entity-create/new" replace />} />
                          <Route path="/entity-create/:entityId" element={isDebugToolsEnabled ? <EntityCreatePage /> : <Navigate to="/battle" replace />} />
                          <Route path="/global-events" element={isDebugToolsEnabled ? <GlobalEventsEditorPage /> : <Navigate to="/battle" replace />} />
                      </Routes>
                  </main>
              </div>
  )
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
