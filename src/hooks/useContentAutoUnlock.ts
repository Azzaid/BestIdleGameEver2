import {useEffect, useMemo, useRef} from "react";
import {BUILDINGS_ATLAS} from "../data/buildings/index.ts";
import {TOWER_PARTS_BY_ID} from "../data/towers/index.ts";
import {TOWER_PLATFORM_BUILDINGS, WALL_SEGMENT_BUILDINGS} from "../data/wall/index.ts";
import {DEVELOPMENT_VECTORS} from "../models/DevlopmentVector.ts";
import {sendNotification} from "../lib/notifications/eventBus.ts";
import {useTypedDispatch, useTypedSelector} from "../store/hooks.ts";
import {
  selectUnlockableBuildingIds,
  selectUnlockableTowerPartIds,
  selectUnlockableWallSegmentIds,
  selectUnlockableWallSuperstructureIds,
  selectUnlockedBuildingIds,
  selectUnlockedTowerPartIds,
  selectUnlockedWallSegmentIds,
  selectUnlockedWallSuperstructureIds,
  selectVisibleBuildingIds,
  selectVisibleTowerPartIds,
  selectVisibleWallSegmentIds,
  selectVisibleWallSuperstructureIds,
} from "../store/unlocks/selectors.ts";
import {
  unlockBuildings,
  unlockTowerParts,
  unlockWallSegments,
  unlockWallSuperstructures,
} from "../store/unlocks/slice.ts";

export function useContentAutoUnlock(): void {
  const dispatch = useTypedDispatch();
  const unlockableBuildingIds = useTypedSelector(selectUnlockableBuildingIds);
  const unlockableTowerPartIds = useTypedSelector(selectUnlockableTowerPartIds);
  const unlockableWallSegmentIds = useTypedSelector(selectUnlockableWallSegmentIds);
  const unlockableWallSuperstructureIds = useTypedSelector(selectUnlockableWallSuperstructureIds);
  const unlockedBuildingIds = useTypedSelector(selectUnlockedBuildingIds);
  const unlockedTowerPartIds = useTypedSelector(selectUnlockedTowerPartIds);
  const unlockedWallSegmentIds = useTypedSelector(selectUnlockedWallSegmentIds);
  const unlockedWallSuperstructureIds = useTypedSelector(selectUnlockedWallSuperstructureIds);
  const visibleBuildingIds = useTypedSelector(selectVisibleBuildingIds);
  const visibleTowerPartIds = useTypedSelector(selectVisibleTowerPartIds);
  const visibleWallSegmentIds = useTypedSelector(selectVisibleWallSegmentIds);
  const visibleWallSuperstructureIds = useTypedSelector(selectVisibleWallSuperstructureIds);
  const initializedUnlockIdsRef = useRef(false);
  const previousVisibleIdsRef = useRef(new Set<string>());
  const initializedVisibleIdsRef = useRef(false);
  const notifiedUnlockIdsRef = useRef(new Set<string>());

  const buildingNamesById = useMemo(() => {
    return Object.fromEntries(
      Object.values(DEVELOPMENT_VECTORS)
        .flatMap(vector => Object.values(BUILDINGS_ATLAS[vector]))
        .map(building => [building.id, building.name]),
    );
  }, []);

  useEffect(() => {
    const notify = initializedUnlockIdsRef.current;

    unlockNewIds({
      unlockableIds: unlockableBuildingIds,
      unlockedIds: unlockedBuildingIds,
      action: ids => dispatch(unlockBuildings(ids)),
      kind: "Building",
      getName: id => buildingNamesById[id] ?? id,
      notifiedIds: notifiedUnlockIdsRef.current,
      notify,
    });
    unlockNewIds({
      unlockableIds: unlockableTowerPartIds,
      unlockedIds: unlockedTowerPartIds,
      action: ids => dispatch(unlockTowerParts(ids)),
      kind: "Tower part",
      getName: id => TOWER_PARTS_BY_ID[id]?.name ?? id,
      notifiedIds: notifiedUnlockIdsRef.current,
      notify,
    });
    unlockNewIds({
      unlockableIds: unlockableWallSegmentIds,
      unlockedIds: unlockedWallSegmentIds,
      action: ids => dispatch(unlockWallSegments(ids)),
      kind: "Wall segment",
      getName: id => WALL_SEGMENT_BUILDINGS[id]?.name ?? id,
      notifiedIds: notifiedUnlockIdsRef.current,
      notify,
    });
    unlockNewIds({
      unlockableIds: unlockableWallSuperstructureIds,
      unlockedIds: unlockedWallSuperstructureIds,
      action: ids => dispatch(unlockWallSuperstructures(ids)),
      kind: "Tower platform",
      getName: id => TOWER_PLATFORM_BUILDINGS[id]?.name ?? id,
      notifiedIds: notifiedUnlockIdsRef.current,
      notify,
    });

    initializedUnlockIdsRef.current = true;
  }, [
    buildingNamesById,
    dispatch,
    unlockableBuildingIds,
    unlockableTowerPartIds,
    unlockableWallSegmentIds,
    unlockableWallSuperstructureIds,
    unlockedBuildingIds,
    unlockedTowerPartIds,
    unlockedWallSegmentIds,
    unlockedWallSuperstructureIds,
  ]);

  useEffect(() => {
    const currentVisibleIds = new Set([
      ...visibleBuildingIds.map(id => `building:${id}`),
      ...visibleTowerPartIds.map(id => `towerPart:${id}`),
      ...visibleWallSegmentIds.map(id => `wallSegment:${id}`),
      ...visibleWallSuperstructureIds.map(id => `wallSuperstructure:${id}`),
    ]);

    if (!initializedVisibleIdsRef.current) {
      initializedVisibleIdsRef.current = true;
      previousVisibleIdsRef.current = currentVisibleIds;
      return;
    }

    for (const visibleId of currentVisibleIds) {
      if (!previousVisibleIdsRef.current.has(visibleId)) {
        const [kind, id] = visibleId.split(":");
        const name = getVisibleContentName(kind, id, buildingNamesById);
        const label = getVisibleContentKindLabel(kind);

        sendNotification({
          title: `${label} now available`,
          message: `${name} is now available.`,
          scheme: "congratulation",
        });
      }
    }

    for (const previousVisibleId of previousVisibleIdsRef.current) {
      if (currentVisibleIds.has(previousVisibleId)) continue;

      const [kind, id] = previousVisibleId.split(":");
      const name = getVisibleContentName(kind, id, buildingNamesById);
      const label = getVisibleContentKindLabel(kind);

      sendNotification({
        title: `${label} no longer available`,
        message: `${name} is no longer available.`,
        scheme: "warning",
      });
    }

    previousVisibleIdsRef.current = currentVisibleIds;
  }, [
    buildingNamesById,
    visibleBuildingIds,
    visibleTowerPartIds,
    visibleWallSegmentIds,
    visibleWallSuperstructureIds,
  ]);
}

function unlockNewIds(options: {
  unlockableIds: readonly string[];
  unlockedIds: readonly string[];
  action: (ids: string[]) => void;
  kind: string;
  getName: (id: string) => string;
  notifiedIds: Set<string>;
  notify: boolean;
}) {
  const unlocked = new Set(options.unlockedIds);
  const newIds = options.unlockableIds.filter(id => !unlocked.has(id));
  if (!newIds.length) return;

  options.action(newIds);

  if (!options.notify) return;

  for (const id of newIds) {
    const notificationId = `${options.kind}:${id}`;
    if (options.notifiedIds.has(notificationId)) continue;

    options.notifiedIds.add(notificationId);
    sendNotification({
      title: `${options.kind} discovered`,
      message: `${options.getName(id)} discovered.`,
      scheme: "congratulation",
    });
  }
}

function getVisibleContentName(
  kind: string | undefined,
  id: string | undefined,
  buildingNamesById: Record<string, string>,
): string {
  if (!id) return "New content";
  if (kind === "building") return buildingNamesById[id] ?? id;
  if (kind === "towerPart") return TOWER_PARTS_BY_ID[id]?.name ?? id;
  if (kind === "wallSegment") return WALL_SEGMENT_BUILDINGS[id]?.name ?? id;
  if (kind === "wallSuperstructure") return TOWER_PLATFORM_BUILDINGS[id]?.name ?? id;
  return id;
}

function getVisibleContentKindLabel(kind: string | undefined): string {
  if (kind === "building") return "Building";
  if (kind === "towerPart") return "Tower part";
  if (kind === "wallSegment") return "Wall segment";
  if (kind === "wallSuperstructure") return "Tower platform";
  return "Option";
}
