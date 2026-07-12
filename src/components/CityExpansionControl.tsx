import {useState} from "react";
import {sendNotification} from "../lib/notifications/eventBus.ts";
import {resetCityForMigration} from "../store/city/slice.ts";
import {selectGlobalSignalRequirementSnapshot} from "../store/globalEvents/selectors.ts";
import {enqueueGlobalSignal} from "../store/globalEvents/slice.ts";
import {useTypedDispatch, useTypedSelector} from "../store/hooks.ts";
import {selectGlobalModifierApplyContext} from "../store/upkeep/selectors.ts";
import {resetWallForMigration} from "../store/wall/slice.ts";
import {ConfirmationModal} from "./ConfirmationModal.tsx";
import * as s from "./CityExpansionControl.css.ts";

const EXODUS_MESSAGE = "Are you ready to abandon city and move on in search for a better place?";

export function CityExpansionControl() {
    const dispatch = useTypedDispatch();
    const modifierContext = useTypedSelector(selectGlobalModifierApplyContext);
    const requirementSnapshot = useTypedSelector(selectGlobalSignalRequirementSnapshot);
    const [isConfirmingExodus, setIsConfirmingExodus] = useState(false);

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
                    className={s.exodusButton}
                    type="button"
                    onClick={() => setIsConfirmingExodus(true)}
                >
                    Exodus
                </button>
            </div>
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
