import { Link } from "react-router-dom";
import * as appTheme from "../App.css.ts";

export default function DevToolsNavLinks() {
  return (
    <>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/progression">Progression</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/ids">IDs</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/entity-create/new">Entity Create</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/content-plan">Content Plan</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/monster-edit/new">Monster Edit</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/enemy-animation-sprites">Enemy Animations</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/gun-part-editor">Part Editor</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/global-events">Global Events</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/homogeneous-values">Values</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/hex-background-editor">Hex Backgrounds</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/hex-background-lab">Hex Lab</Link>
      </li>
      <li>
        <Link className={appTheme.navBarLink} to="/dev/damage-area-vfx">Area VFX</Link>
      </li>
    </>
  );
}
