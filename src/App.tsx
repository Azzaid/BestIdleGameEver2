import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider, useTheme } from './theme/ThemeProvider'
import * as appTheme from './App.css.ts'

// Import page components
import BattlePage from './pages/Battle/BattlePage'
import BuildPage from './pages/Build/BuildPage'
import ResearchPage from './pages/Research/ResearchPage'
import CityPage from './pages/City/CityPage'
import StatisticsPage from './pages/Statistics/StatisticsPage'

function ThemeSwitcher() {
  const { setTheme } = useTheme();
  return (
    <div className={appTheme.themeSwitcher}>
      <button onClick={() => setTheme('tech')}>Tech</button>
      <button onClick={() => setTheme('nature')}>Nature</button>
      <button onClick={() => setTheme('medieval')}>Medieval</button>
      <button onClick={() => setTheme('aether')}>Aether</button>
    </div>
  );
}

function App() {
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
  )
}

export default App
