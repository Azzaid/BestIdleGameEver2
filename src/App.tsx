import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import {Provider} from "react-redux";
import {store} from "./store";
import { ThemeProvider } from './theme/ThemeProvider'
import { useTheme } from './theme/useTheme.ts'
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
import {THEME_NAMES} from "./models/Theme.ts";
import {UpkeepBar} from "./components/UpkeepBar.tsx";
import {useTypedSelector} from "./store/hooks.ts";
import {selectCitySignatureStatus} from "./store/upkeep/selectors.ts";
import {selectHasAnyTowerBuild} from "./store/towers/selectors.ts";
import {useTypedDispatch} from "./store/hooks.ts";
import {selectIsDebugModeEnabled} from "./store/debug/selectors.ts";
import {toggleDebugMode} from "./store/debug/slice.ts";
import { NotificationCenter } from "./components/Notifications/NotificationCenter.tsx";
import { useResearchAutoUnlock } from "./pages/Research/useResearchAutoUnlock.ts";
import {CityExpansionControl} from "./components/CityExpansionControl.tsx";

//this is temporary theme switcher
function ThemeSwitcher() {
  const { setTheme } = useTheme();
  return (
    <div className={appTheme.themeSwitcher}>
        <button onClick={() => setTheme(THEME_NAMES.tech)}>Tech</button>
        <button onClick={() => setTheme(THEME_NAMES.nature)}>Nature</button>
        <button onClick={() => setTheme(THEME_NAMES.medieval)}>Medieval</button>
        <button onClick={() => setTheme(THEME_NAMES.aether)}>Aether</button>
        <button onClick={() => setTheme(THEME_NAMES.default)}>Default</button>
    </div>
  );
}

function AppFrame() {
  const dispatch = useTypedDispatch();
  const location = useLocation();
  const signatureStatus = useTypedSelector(selectCitySignatureStatus);
  const hasAnyTowerBuild = useTypedSelector(selectHasAnyTowerBuild);
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
  const isBuildBlocked = signatureStatus.isBesieged && hasAnyTowerBuild;
  const shouldShowUpkeepBar = location.pathname !== "/" && location.pathname !== "/battle";
  const shouldShowCityExpansionControl = location.pathname === "/city";

  useResearchAutoUnlock();

  return (
              <div className={appTheme.appContainer}>
                  <nav className={appTheme.appNav}>
                      <div className={appTheme.navLeft}>
                          <label className={appTheme.debugToggle}>
                              <input
                                  type="checkbox"
                                  checked={isDebugModeEnabled}
                                  onChange={() => dispatch(toggleDebugMode())}
                              />
                              Debug
                          </label>
                          <div className={appTheme.appTitle}>Tower Defense Idle</div>
                      </div>
                      <ul className={appTheme.navLinks}>
                          <li className={appTheme.navBarItem}>
                              <Link className={appTheme.navBarLink} to="/battle">Battle</Link>
                          </li>
                          <li>
                              <Link className={isBuildBlocked ? appTheme.navBarLinkBlocked : appTheme.navBarLink} to="/build">Build</Link>
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
                          {isDebugModeEnabled && (
                              <>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/progression">Progression</Link>
                                  </li>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/gun-part-editor">Part Editor</Link>
                                  </li>
                                  <li>
                                      <Link className={appTheme.navBarLink} to="/ids">IDs</Link>
                                  </li>
                              </>
                          )}
                      </ul>
                      <div className={appTheme.themeSwitcher}>
                        {/*<ThemeSwitcher />*/}
                      </div>
                  </nav>
                  <NotificationCenter />
                  {shouldShowUpkeepBar && (
                      <UpkeepBar rightSlot={shouldShowCityExpansionControl ? <CityExpansionControl /> : undefined}/>
                  )}
                  <main className={appTheme.appContent}>
                      <Routes>
                          <Route path="/" element={<BattlePage />} />
                          <Route path="/battle" element={<BattlePage />} />
                          <Route path="/build" element={isBuildBlocked ? <BlockedPage title="Build Blocked" /> : <BuildPage/>} />
                          <Route path="/research" element={signatureStatus.isBesieged ? <BlockedPage title="Research Blocked" /> : <ResearchPage />} />
                          <Route path="/city" element={<CityPage />} />
                          <Route path="/statistics" element={<StatisticsPage />} />
                          <Route path="/progression" element={<ProgressionPage />} />
                          <Route path="/gun-part-editor" element={<GunPartEditorPage />} />
                          <Route path="/ids" element={<IdAuditPage />} />
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
