import { Navigate, useRoutes } from "react-router-dom";
import ProgressionPage from "../pages/Progression/ProgressionPage.tsx";
import GunPartEditorPage from "../pages/GunPartEditor/GunPartEditorPage.tsx";
import IdAuditPage from "../pages/IdAudit/IdAuditPage.tsx";
import EntityCreatePage from "../pages/EntityCreate/EntityCreatePage.tsx";
import ContentPlanPage from "../pages/ContentPlan/ContentPlanPage.tsx";
import MonsterEditPage from "../pages/MonsterEdit/MonsterEditPage.tsx";
import GlobalEventsEditorPage from "../pages/GlobalEventsEditor/GlobalEventsEditorPage.tsx";
import HexBackgroundEditorPage from "../pages/HexBackgroundEditor/HexBackgroundEditorPage.tsx";
import HexBackgroundLabPage from "../pages/HexBackgroundLab/HexBackgroundLabPage.tsx";
import HomogeneousValuesEditorPage from "../pages/HomogeneousValuesEditor/HomogeneousValuesEditorPage.tsx";
import EnemyAnimationSpriteSheetPage from "../pages/EnemyAnimationSpriteSheet/EnemyAnimationSpriteSheetPage.tsx";
import DamageAreaVfxEditorPage from "../pages/DamageAreaVfxEditor/DamageAreaVfxEditorPage.tsx";

export default function DevToolsRouteGate({enabled}: {enabled: boolean}) {
  const routeElement = useRoutes([
    {
      index: true,
      element: <Navigate to="/dev/progression" replace />,
    },
    {
      path: "progression",
      element: enabled ? <ProgressionPage /> : <Navigate to="/" replace />,
    },
    {
      path: "gun-part-editor",
      element: enabled ? <GunPartEditorPage /> : <Navigate to="/" replace />,
    },
    {
      path: "ids",
      element: enabled ? <IdAuditPage /> : <Navigate to="/" replace />,
    },
    {
      path: "entity-create",
      element: <Navigate to="/dev/entity-create/new" replace />,
    },
    {
      path: "entity-create/:entityId",
      element: enabled ? <EntityCreatePage /> : <Navigate to="/" replace />,
    },
    {
      path: "content-plan",
      element: enabled ? <ContentPlanPage /> : <Navigate to="/" replace />,
    },
    {
      path: "monster-edit",
      element: <Navigate to="/dev/monster-edit/new" replace />,
    },
    {
      path: "monster-edit/:monsterId",
      element: enabled ? <MonsterEditPage /> : <Navigate to="/" replace />,
    },
    {
      path: "global-events",
      element: enabled ? <GlobalEventsEditorPage /> : <Navigate to="/" replace />,
    },
    {
      path: "homogeneous-values",
      element: enabled ? <HomogeneousValuesEditorPage /> : <Navigate to="/" replace />,
    },
    {
      path: "hex-background-editor",
      element: enabled ? <HexBackgroundEditorPage /> : <Navigate to="/" replace />,
    },
    {
      path: "hex-background-lab",
      element: enabled ? <HexBackgroundLabPage /> : <Navigate to="/" replace />,
    },
    {
      path: "enemy-animation-sprites",
      element: enabled ? <EnemyAnimationSpriteSheetPage /> : <Navigate to="/" replace />,
    },
    {
      path: "damage-area-vfx",
      element: enabled ? <DamageAreaVfxEditorPage /> : <Navigate to="/" replace />,
    },
  ]);

  return routeElement;
}
