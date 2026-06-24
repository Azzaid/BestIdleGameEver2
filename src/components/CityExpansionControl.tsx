import {useState} from "react";
import {sendNotification} from "../lib/notifications/eventBus.ts";
import {expandCityRadius, resetCityForMigration} from "../store/city/slice.ts";
import {selectGlobalSignalRequirementSnapshot} from "../store/globalEvents/selectors.ts";
import {enqueueGlobalSignal} from "../store/globalEvents/slice.ts";
import {useTypedDispatch, useTypedSelector} from "../store/hooks.ts";
import {selectCitySignatureStatus, selectGlobalModifierApplyContext} from "../store/upkeep/selectors.ts";
import {resetWallForMigration} from "../store/wall/slice.ts";
import {ConfirmationModal} from "./ConfirmationModal.tsx";
import * as s from "./CityExpansionControl.css.ts";

const EXPAND_BLOCK_REASON = "The city is besieged. Raise controlled territory in battle before expanding.";
const EXPAND_WARNING = "City grows bigger, more noticeable and attracts more monsters";
const EXODUS_MESSAGE = "Are you ready to abandon city and move on in search for a better place?";

export function CityExpansionControl() {
    const dispatch = useTypedDispatch();
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const modifierContext = useTypedSelector(selectGlobalModifierApplyContext);
    const requirementSnapshot = useTypedSelector(selectGlobalSignalRequirementSnapshot);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmingExodus, setIsConfirmingExodus] = useState(false);

    const handleExpandConfirm = () => {
        dispatch(expandCityRadius());
        dispatch(enqueueGlobalSignal({type: "cityExpanded"}));
        setIsConfirming(false);
        sendNotification({
            title: "City Expanded",
            message: EXPAND_WARNING,
            scheme: "warning",
        });
    };

    const handleExodusConfirm = () => {
        dispatch(enqueueGlobalSignal({
            signal: {type: "migration"},
            requirementSnapshot,
            modifierContext,
        }));
        dispatch(enqueueGlobalSignal({
            signal: {type: "cityAbandoned"},
            requirementSnapshot,
            modifierContext,
        }));
        dispatch(enqueueGlobalSignal({type: "cityMigrated"}));
        dispatch(resetCityForMigration());
        dispatch(resetWallForMigration());
        setIsConfirmingExodus(false);
        sendNotification({
            title: "Exodus Complete",
            message: "The old city has been abandoned. A new settlement begins.",
            scheme: "warning",
        });
    };

    return (
        <>
            <div className={s.controlGroup}>
                <button
                    className={s.expandButton}
                    type="button"
                    disabled={signatureStatus.isBesieged}
                    title={signatureStatus.isBesieged ? EXPAND_BLOCK_REASON : undefined}
                    onClick={() => setIsConfirming(true)}
                >
                    Expand City
                </button>
                <button
                    className={s.exodusButton}
                    type="button"
                    disabled={signatureStatus.isBesieged}
                    title={signatureStatus.isBesieged ? EXPAND_BLOCK_REASON : undefined}
                    onClick={() => setIsConfirmingExodus(true)}
                >
                    Exodus
                </button>
            </div>
            {isConfirming && (
                <ConfirmationModal
                    title="Expand City?"
                    message={EXPAND_WARNING}
                    confirmLabel="Expand"
                    onCancel={() => setIsConfirming(false)}
                    onConfirm={handleExpandConfirm}
                />
            )}
            {isConfirmingExodus && (
                <ConfirmationModal
                    title="Exodus?"
                    message={EXODUS_MESSAGE}
                    confirmLabel="Exodus"
                    onCancel={() => setIsConfirmingExodus(false)}
                    onConfirm={handleExodusConfirm}
                />
            )}
        </>
    );
}
