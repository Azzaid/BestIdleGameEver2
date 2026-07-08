import { Navigate, useRoutes } from "react-router-dom";
import ProgressionPage from "../pages/Progression/ProgressionPage.tsx";
import GunPartEditorPage from "../pages/GunPartEditor/GunPartEditorPage.tsx";
import IdAuditPage from "../pages/IdAudit/IdAuditPage.tsx";
import EntityCreatePage from "../pages/EntityCreate/EntityCreatePage.tsx";
import ContentPlanPage from "../pages/ContentPlan/ContentPlanPage.tsx";
import MonsterEditPage from "../pages/MonsterEdit/MonsterEditPage.tsx";
import GlobalEventsEditorPage from "../pages/GlobalEventsEditor/GlobalEventsEditorPage.tsx";
import HexBackgroundEditorPage from "../pages/HexBackgroundEditor/HexBackgroundEditorPage.tsx";
import HomogeneousValuesEditorPage from "../pages/HomogeneousValuesEditor/HomogeneousValuesEditorPage.tsx";

export default function DevToolsRouteGate({enabled}: {enabled: boolean}) {
  const routeElement = useRoutes([
    {
      path: "progression",
      element: enabled ? <ProgressionPage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "gun-part-editor",
      element: enabled ? <GunPartEditorPage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "ids",
      element: enabled ? <IdAuditPage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "entity-create",
      element: <Navigate to="/entity-create/new" replace />,
    },
    {
      path: "entity-create/:entityId",
      element: enabled ? <EntityCreatePage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "content-plan",
      element: enabled ? <ContentPlanPage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "monster-edit",
      element: <Navigate to="/monster-edit/new" replace />,
    },
    {
      path: "monster-edit/:monsterId",
      element: enabled ? <MonsterEditPage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "global-events",
      element: enabled ? <GlobalEventsEditorPage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "homogeneous-values",
      element: enabled ? <HomogeneousValuesEditorPage /> : <Navigate to="/battle" replace />,
    },
    {
      path: "hex-background-editor",
      element: enabled ? <HexBackgroundEditorPage /> : <Navigate to="/battle" replace />,
    },
  ]);

  return routeElement;
}
