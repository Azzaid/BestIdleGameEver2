import {useEffect, useMemo, useRef} from "react";
import {researchTree} from "../../data/research/index.ts";
import {sendNotification} from "../../lib/notifications/eventBus.ts";
import {canPurchaseResearch} from "../../models/research/researchGraph.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {selectCityHexes, selectCompleteCityStructureIds} from "../../store/city/selectors.ts";
import {selectAetherAtmosphereLevels} from "../../store/homogeneousValues/selectors.ts";
import {selectCityResolution, selectCityTraceStatus} from "../../store/upkeep/selectors.ts";
import {selectPurchasedTechsIds} from "../../store/research/selectors.ts";
import {purchaseTech} from "../../store/research/slice.ts";

function collectAutoUnlockableTechIds(
    purchasedTechsIds: readonly string[],
    context: Omit<Parameters<typeof canPurchaseResearch>[1], "purchased">,
): string[] {
    const purchased = new Set(purchasedTechsIds);
    const toUnlock: string[] = [];

    while (true) {
        let found = false;

        for (const node of Object.values(researchTree)) {
            if (node.id === "root" || purchased.has(node.id)) continue;

            if (canPurchaseResearch(node, {...context, purchased})) {
                toUnlock.push(node.id);
                purchased.add(node.id);
                found = true;
            }
        }

        if (!found) break;
    }

    return toUnlock;
}

export function useResearchAutoUnlock(): void {
    const dispatch = useTypedDispatch();
    const purchasedTechsIds = useTypedSelector(selectPurchasedTechsIds);
    const cityHexes = useTypedSelector(selectCityHexes);
    const completeStructureIds = useTypedSelector(selectCompleteCityStructureIds);
    const {effectiveUpkeep} = useTypedSelector(selectCityResolution);
    const aetherAtmosphereLevels = useTypedSelector(selectAetherAtmosphereLevels);
    const traceStatus = useTypedSelector(selectCityTraceStatus);
    const notifiedTechIdsRef = useRef(new Set<string>());

    const builtBuildingIds = useMemo(() => {
        return new Set(cityHexes.flatMap(hex => [
            !hex.partOfStructureId || (hex.structureCoreCellKey ?? hex.cellKey) === hex.cellKey ? hex.buildingKey : null,
            hex.wallKey,
            hex.wallTopKey,
        ].filter((buildingId): buildingId is string => Boolean(buildingId))));
    }, [cityHexes]);

    useEffect(() => {
        const toUnlock = collectAutoUnlockableTechIds(purchasedTechsIds, {
            builtBuildingIds,
            completeStructureIds,
            effectiveUpkeep,
            aetherAtmosphereLevels,
            isBesieged: traceStatus.isBesieged,
        });

        for (const techId of toUnlock) {
            dispatch(purchaseTech(techId));

            if (notifiedTechIdsRef.current.has(techId)) continue;
            notifiedTechIdsRef.current.add(techId);

            const node = researchTree[techId];
            if (!node) continue;

            sendNotification({
                title: node.name,
                message: node.summary ?? `${node.name} technology unlocked.`,
                scheme: node.vector,
            });
        }
    }, [
        aetherAtmosphereLevels,
        builtBuildingIds,
        completeStructureIds,
        dispatch,
        effectiveUpkeep,
        purchasedTechsIds,
        traceStatus.isBesieged,
    ]);
}
