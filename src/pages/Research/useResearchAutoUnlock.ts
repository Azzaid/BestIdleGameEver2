import {useEffect, useRef} from "react";
import {researchTree} from "../../data/research/index.ts";
import {sendNotification} from "../../lib/notifications/eventBus.ts";
import {getResearchNodeThemeName} from "../../models/research/ResearchNode.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {selectCitySignatureStatus} from "../../store/upkeep/selectors.ts";
import {selectPurchasedTechsIds} from "../../store/research/selectors.ts";
import {purchaseTech} from "../../store/research/slice.ts";
import {selectUnlockableTechnologyIds} from "../../store/unlocks/selectors.ts";

export function useResearchAutoUnlock(): void {
    const dispatch = useTypedDispatch();
    const purchasedTechsIds = useTypedSelector(selectPurchasedTechsIds);
    const unlockableTechIds = useTypedSelector(selectUnlockableTechnologyIds);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const notifiedTechIdsRef = useRef(new Set<string>());

    useEffect(() => {
        if (signatureStatus.isBesieged) return;

        const purchased = new Set(purchasedTechsIds);
        const toUnlock = unlockableTechIds.filter(techId => !purchased.has(techId));

        for (const techId of toUnlock) {
            dispatch(purchaseTech(techId));

            if (notifiedTechIdsRef.current.has(techId)) continue;
            notifiedTechIdsRef.current.add(techId);

            const node = researchTree[techId];
            if (!node) continue;
            const scheme = getResearchNodeThemeName(node);

            sendNotification({
                title: node.name,
                message: node.summary ?? `${node.name} technology unlocked.`,
                scheme: scheme === "default" ? "tech" : scheme,
            });
        }
    }, [
        dispatch,
        purchasedTechsIds,
        signatureStatus.isBesieged,
        unlockableTechIds,
    ]);
}
