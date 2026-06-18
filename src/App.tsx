import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
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
import {selectCityTraceStatus} from "./store/upkeep/selectors.ts";
import {selectHasAnyTowerBuild} from "./store/towers/selectors.ts";
import {useTypedDispatch} from "./store/hooks.ts";
import {selectIsDebugModeEnabled} from "./store/debug/selectors.ts";
import {toggleDebugMode} from "./store/debug/slice.ts";
import { NotificationCenter } from "./components/Notifications/NotificationCenter.tsx";
import { sendNotification } from "./lib/notifications/eventBus.ts";
import { vars } from "./theme/theme.css.ts";
import { useResearchAutoUnlock } from "./pages/Research/useResearchAutoUnlock.ts";

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

function App() {
  const dispatch = useTypedDispatch();
  const traceStatus = useTypedSelector(selectCityTraceStatus);
  const hasAnyTowerBuild = useTypedSelector(selectHasAnyTowerBuild);
  const isDebugModeEnabled = useTypedSelector(selectIsDebugModeEnabled);
  const isBuildBlocked = traceStatus.isBesieged && hasAnyTowerBuild;

  useResearchAutoUnlock();

  return (
      <ThemeProvider initialTheme={'tech'}>
          <Router>
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
                              <Link className={traceStatus.isBesieged ? appTheme.navBarLinkBlocked : appTheme.navBarLink} to="/research">Research</Link>
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
                        <ThemeSwitcher />
                        <button
                          type="button"
                          onClick={() => {
                            const schemes = ["tech","nature","medieval","aether","alert","warning","congratulation"] as const;
                            const pick = schemes[Math.floor(Math.random()*schemes.length)];
                            sendNotification({
                              title: "Notification test",
                              message: `This is a sample ${pick} notification.`,
                              scheme: pick,
                            });
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: `1px solid ${vars.color.border.default}`,
                            background: vars.color.background.surfaceHover,
                            color: vars.color.text.primary,
                            cursor: 'pointer',
                          }}
                          title="Send a sample notification"
                        >
                          Test notification
                        </button>
                      </div>
                  </nav>
                  <NotificationCenter />
                  <UpkeepBar/>
                  <main className={appTheme.appContent}>
                      <Routes>
                          <Route path="/" element={<BattlePage />} />
                          <Route path="/battle" element={<BattlePage />} />
                          <Route path="/build" element={isBuildBlocked ? <BlockedPage title="Build Blocked" /> : <BuildPage/>} />
                          <Route path="/research" element={traceStatus.isBesieged ? <BlockedPage title="Research Blocked" /> : <ResearchPage />} />
                          <Route path="/city" element={<CityPage />} />
                          <Route path="/statistics" element={<StatisticsPage />} />
                          <Route path="/progression" element={<ProgressionPage />} />
                          <Route path="/gun-part-editor" element={<GunPartEditorPage />} />
                          <Route path="/ids" element={<IdAuditPage />} />
                      </Routes>
                  </main>
              </div>
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
