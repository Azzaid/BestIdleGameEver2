import {createSelector} from "@reduxjs/toolkit";
import {useEffect, useMemo, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {GLOBAL_EVENT_LIST} from "../../data/globalEvents/index.ts";
import {sendNotification} from "../../lib/notifications/eventBus.ts";
import {
  getRunnableGlobalEvents,
  type GlobalEventDefinition,
  type GlobalSignal,
  type GlobalSignalMessage,
  type GlobalSignalRequirementSnapshot,
  type GlobalModifierApplyContext,
} from "../../models/globalEvents.ts";
import type {RequirementResolutionData} from "../../models/progression/requirements.ts";
import type {AppDispatch} from "../../models/store/appStore.ts";
import {selectCityResolution} from "../../store/city/selectors.ts";
import {
  selectExecutedGlobalEventIds,
  selectPendingGlobalSignals,
} from "../../store/globalEvents/selectors.ts";
import {
  clearPendingGlobalSignals,
  enqueueGlobalSignal,
  executeGlobalEvents,
} from "../../store/globalEvents/slice.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {selectPurchasedTechsIds} from "../../store/research/selectors.ts";
import {selectGlobalModifierApplyContext} from "../../store/upkeep/selectors.ts";
import {selectRequirementResolutionData, selectUnlockedBuildingIds} from "../../store/unlocks/selectors.ts";

const selectConstructedBuildingIds = createSelector(
  [selectCityResolution],
  (cityResolution): string[] => [...cityResolution.buildingIds].sort(),
);

const selectRequirementSignalSignature = createSelector(
  [selectRequirementResolutionData],
  (data): string => [
    `buildings=${[...data.resolvedCityData.buildingIds].sort().join(",")}`,
    `keywords=${[...data.resolvedCityData.buildingKeywords].sort().join(",")}`,
    `tech=${[...data.unlockedTechnologyIds].sort().join(",")}`,
    `flags=${[...(data.globalFlagIds ?? new Set<string>())].sort().join(",")}`,
    `values=${Object.entries(data.resolvedCityData.homogeneousValues)
      .filter(([, value]) => value !== 0)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, value]) => `${id}:${value}`)
      .join(",")}`,
  ].join("|"),
);

export function useGlobalEventSignals(): void {
  useQueueStartupSignals();
  useQueueDerivedSignals();
  useProcessPendingSignals();
}

function useQueueStartupSignals(): void {
  const dispatch = useTypedDispatch();
  const hasQueuedStartupSignalsRef = useRef(false);

  useEffect(() => {
    if (hasQueuedStartupSignalsRef.current) return;

    hasQueuedStartupSignalsRef.current = true;
    dispatch(enqueueGlobalSignal({type: "gameStarted"}));
  }, [dispatch]);
}

function useQueueDerivedSignals(): void {
  const dispatch = useTypedDispatch();
  const purchasedTechIds = useTypedSelector(selectPurchasedTechsIds);
  const unlockedBuildingIds = useTypedSelector(selectUnlockedBuildingIds);
  const constructedBuildingIds = useTypedSelector(selectConstructedBuildingIds);
  const requirementSignalSignature = useTypedSelector(selectRequirementSignalSignature);
  const previousPurchasedTechIdsRef = useRef<Set<string> | null>(null);
  const previousUnlockedBuildingIdsRef = useRef<Set<string> | null>(null);
  const previousConstructedBuildingIdsRef = useRef<Set<string> | null>(null);
  const previousRequirementSignalSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    const previousTechIds = previousPurchasedTechIdsRef.current;
    previousPurchasedTechIdsRef.current = new Set(purchasedTechIds);
    if (!previousTechIds) return;

    enqueueSignals(dispatch, purchasedTechIds
      .filter(technologyId => !previousTechIds.has(technologyId))
      .map((technologyId): GlobalSignal => ({type: "technologyUnlocked", technologyId})));
  }, [dispatch, purchasedTechIds]);

  useEffect(() => {
    const previousBuildingIds = previousUnlockedBuildingIdsRef.current;
    previousUnlockedBuildingIdsRef.current = new Set(unlockedBuildingIds);
    if (!previousBuildingIds) return;

    enqueueSignals(dispatch, unlockedBuildingIds
      .filter(buildingId => !previousBuildingIds.has(buildingId))
      .map((buildingId): GlobalSignal => ({type: "buildingDiscovered", buildingId})));
  }, [dispatch, unlockedBuildingIds]);

  useEffect(() => {
    const previousBuildingIds = previousConstructedBuildingIdsRef.current;
    previousConstructedBuildingIdsRef.current = new Set(constructedBuildingIds);
    if (!previousBuildingIds) return;

    enqueueSignals(dispatch, constructedBuildingIds
      .filter(buildingId => !previousBuildingIds.has(buildingId))
      .map((buildingId): GlobalSignal => ({type: "buildingConstructed", buildingId})));
  }, [constructedBuildingIds, dispatch]);

  useEffect(() => {
    if (previousRequirementSignalSignatureRef.current === requirementSignalSignature) return;

    previousRequirementSignalSignatureRef.current = requirementSignalSignature;
    dispatch(enqueueGlobalSignal({type: "requirementsMet"}));
  }, [dispatch, requirementSignalSignature]);
}

function useProcessPendingSignals(): void {
  const dispatch = useTypedDispatch();
  const navigate = useNavigate();
  const pendingSignalMessages = useTypedSelector(selectPendingGlobalSignals);
  const executedEventIds = useTypedSelector(selectExecutedGlobalEventIds);
  const requirementData = useTypedSelector(selectRequirementResolutionData);
  const modifierContext = useTypedSelector(selectGlobalModifierApplyContext);
  const runnableEventMessages = useMemo(() => {
    return getRunnableEventsForSignals(
      pendingSignalMessages,
      new Set(executedEventIds),
      requirementData,
      modifierContext,
    );
  }, [executedEventIds, modifierContext, pendingSignalMessages, requirementData]);

  useEffect(() => {
    if (pendingSignalMessages.length === 0) return;

    if (runnableEventMessages.length > 0) {
      dispatch(executeGlobalEvents(runnableEventMessages.map(({event, context}) => ({
        eventId: event.id,
        actions: event.actions,
        modifierContext: context,
        eventsToForesee: event.eventsToForesee,
        notificationLevel: event.notificationLevel,
      }))));
      for (const {event} of runnableEventMessages) {
        if (event.notificationLevel !== "notify") continue;

        sendNotification({
          title: event.title,
          message: event.hint ?? event.description ?? "A global event occurred.",
          imageUrl: event.imageSrc,
          scheme: "tech",
        });
      }
      if (runnableEventMessages.some(({event}) => (event.notificationLevel ?? "force") === "force")) {
        navigate("/history");
      }
    }

    dispatch(clearPendingGlobalSignals());
  }, [dispatch, navigate, pendingSignalMessages.length, runnableEventMessages]);
}

function getRunnableEventsForSignals(
  messages: readonly GlobalSignalMessage[],
  executedEventIds: ReadonlySet<string>,
  requirementData: RequirementResolutionData,
  defaultModifierContext: GlobalModifierApplyContext,
): Array<{event: GlobalEventDefinition; context: GlobalModifierApplyContext}> {
  const eventIds = new Set<string>();
  const eventMessages: Array<{event: GlobalEventDefinition; context: GlobalModifierApplyContext}> = [];

  for (const message of messages) {
    const messageRequirementData = message.requirementSnapshot
      ? createRequirementDataFromSnapshot(message.requirementSnapshot)
      : requirementData;

    for (const event of getRunnableGlobalEvents(GLOBAL_EVENT_LIST, message.signal, messageRequirementData, executedEventIds)) {
      if (eventIds.has(event.id)) continue;

      eventIds.add(event.id);
      eventMessages.push({
        event,
        context: message.modifierContext ?? defaultModifierContext,
      });
    }
  }

  return eventMessages;
}

function enqueueSignals(dispatch: AppDispatch, signals: readonly GlobalSignal[]): void {
  if (signals.length > 0) {
    dispatch(enqueueGlobalSignal([...signals]));
  }
}

function createRequirementDataFromSnapshot(snapshot: GlobalSignalRequirementSnapshot): RequirementResolutionData {
  return {
    resolvedCityData: {
      buildingIds: new Set(snapshot.buildingIds),
      buildingKeywords: new Set(snapshot.buildingKeywords),
      homogeneousValues: snapshot.homogeneousValues,
    } as RequirementResolutionData["resolvedCityData"],
    unlockedTechnologyIds: new Set(snapshot.technologyIds),
    globalFlagIds: new Set(snapshot.globalFlagIds),
  };
}
