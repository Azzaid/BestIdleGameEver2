import { Link } from "react-router-dom";
import * as appTheme from "../App.css.ts";

export default function DevToolsNavLinks() {
  return (
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
        <Link className={appTheme.navBarLink} to="/monster-edit/new">Monster Edit</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/gun-part-editor">Part Editor</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/global-events">Global Events</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/homogeneous-values">Values</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/hex-background-editor">Hex Backgrounds</Link>
      </li>
    </>
  );
}
