import { Link, Navigate, Route, Routes } from "react-router-dom";
import * as appTheme from "../App.css.ts";
import DevToolsNavLinks from "./DevToolsNavLinks.tsx";
import DevToolsRouteGate from "./DevToolsRouteGate.tsx";

export default function DevShell({enabled}: {enabled: boolean}) {
  if (!enabled) {
    return <Navigate to="/city" replace />;
  }

  return (
    <div className={appTheme.appContainer}>
      <nav className={appTheme.appNav}>
        <div className={appTheme.navLeft}>
          <div className={appTheme.appTitle}>Developer Tools</div>
          <Link className={appTheme.navBarLink} to="/city">Back to Game</Link>
        </div>
        <ul className={appTheme.navLinks}>
          <DevToolsNavLinks />
        </ul>
        <div className={appTheme.themeSwitcher} />
      </nav>
      <main className={appTheme.appContent}>
        <Routes>
          <Route path="/*" element={<DevToolsRouteGate enabled={enabled} />} />
        </Routes>
      </main>
    </div>
  );
}
