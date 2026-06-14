import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import {Provider} from "react-redux";
import {store} from "./store";
import { ThemeProvider, useTheme } from './theme/ThemeProvider'
import * as appTheme from './App.css.ts'

// Import page components
import BattlePage from './pages/Battle/BattlePage'
import BuildPage from './pages/Build/BuildPage'
import ResearchPage from './pages/Research/ResearchPage'
import CityPage from './pages/City/CityPage'
import StatisticsPage from './pages/Statistics/StatisticsPage'
import ProgressionPage from './pages/Progression/ProgressionPage.tsx'
import {THEME_NAMES} from "./models/Theme.ts";
import {UpkeepBar} from "./components/UpkeepBar.tsx";
import {useTypedSelector} from "./store/hooks.ts";
import {selectCityTraceStatus} from "./store/upkeep/selectors.ts";
import {selectHasActiveTowerBuild} from "./store/towers/selectors.ts";

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
  const traceStatus = useTypedSelector(selectCityTraceStatus);
  const hasActiveTowerBuild = useTypedSelector(selectHasActiveTowerBuild);
  const isBuildBlocked = traceStatus.isBesieged && hasActiveTowerBuild;

  return (
      <ThemeProvider initialTheme={'tech'}>
          <Router>
              <div className={appTheme.appContainer}>
                  <nav className={appTheme.appNav}>
                      <div className={appTheme.appTitle}>Tower Defense Idle</div>
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
                          <li>
                              <Link className={appTheme.navBarLink} to="/progression">Progression</Link>
                          </li>
                      </ul>
                      <ThemeSwitcher />
                  </nav>
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
