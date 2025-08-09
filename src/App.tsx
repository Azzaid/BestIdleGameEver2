import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider, useTheme } from './theme/ThemeProvider'
import * as s from './App.css.ts'

// Import page components
import BattlePage from './pages/Battle/BattlePage'
import BuildPage from './pages/Build/BuildPage_hex'
import ResearchPage from './pages/Research/ResearchPage'
import CityPage from './pages/City/CityPage'
import StatisticsPage from './pages/Statistics/StatisticsPage'

function ThemeSwitcher() {
  const { setTheme } = useTheme();
  return (
    <div className={s.themeSwitcher}>
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
        <div className={s.appContainer}>
          <nav className={s.appNav}>
            <div className={s.appTitle}>Tower Defense Idle</div>
            <ul className={s.navLinks}>
              <li className={s.navBarItem}>
                <Link className={s.navBarLink} to="/battle">Battle</Link>
              </li>
              <li>
                <Link className={s.navBarLink} to="/build">Build</Link>
              </li>
              <li>
                <Link className={s.navBarLink} to="/research">Research</Link>
              </li>
              <li>
                <Link className={s.navBarLink} to="/city">City</Link>
              </li>
              <li>
                <Link className={s.navBarLink} to="/statistics">Statistics</Link>
              </li>
            </ul>
            <ThemeSwitcher />
          </nav>
          
          <main className={s.appContent}>
            <Routes>
              <Route path="/" element={<BattlePage />} />
              <Route path="/battle" element={<BattlePage />} />
              <Route path="/build" element={<BuildPage spriteAtlas={{}}/>} />
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
