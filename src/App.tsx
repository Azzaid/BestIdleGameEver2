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
import {THEME_NAMES} from "./models/Theme.ts";
import {UpkeepBar} from "./components/UpkeepBar.tsx";

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
  return (
      <Provider store={store}>
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
                                  <Link className={appTheme.navBarLink} to="/build">Build</Link>
                              </li>
                              <li>
                                  <Link className={appTheme.navBarLink} to="/research">Research</Link>
                              </li>
                              <li>
                                  <Link className={appTheme.navBarLink} to="/city">City</Link>
                              </li>
                              <li>
                                  <Link className={appTheme.navBarLink} to="/statistics">Statistics</Link>
                              </li>
                          </ul>
                          <ThemeSwitcher />
                      </nav>
                      <UpkeepBar/>
                      <main className={appTheme.appContent}>
                          <Routes>
                              <Route path="/" element={<BattlePage />} />
                              <Route path="/battle" element={<BattlePage />} />
                              <Route path="/build" element={<BuildPage/>} />
                              <Route path="/research" element={<ResearchPage />} />
                              <Route path="/city" element={<CityPage />} />
                              <Route path="/statistics" element={<StatisticsPage />} />
                          </Routes>
                      </main>
                  </div>
              </Router>
          </ThemeProvider>
      </Provider>
  )
}

export default App
