import {useMemo, useState} from "react";
import {sendNotification} from "../lib/notifications/eventBus.ts";
import type {GlobalEventTrigger} from "../models/globalEvents.ts";
import {expandCityRadius, resetCityForMigration} from "../store/city/slice.ts";
import {selectRunnableGlobalEventsForTrigger} from "../store/globalEvents/selectors.ts";
import {executeGlobalEvents} from "../store/globalEvents/slice.ts";
import {useTypedDispatch, useTypedSelector} from "../store/hooks.ts";
import {selectCitySignatureStatus, selectGlobalModifierApplyContext} from "../store/upkeep/selectors.ts";
import {resetWallForMigration} from "../store/wall/slice.ts";
import {ConfirmationModal} from "./ConfirmationModal.tsx";
import * as s from "./CityExpansionControl.css.ts";

const EXPAND_BLOCK_REASON = "The city is besieged. Raise controlled territory in battle before expanding.";
const EXPAND_WARNING = "City grows bigger, more noticeable and attracts more monsters";
const EXODUS_MESSAGE = "Are you ready to abandon city and move on in search for a better place?";
const MIGRATION_TRIGGER: GlobalEventTrigger = {type: "migration"};

export function CityExpansionControl() {
    const dispatch = useTypedDispatch();
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const selectMigrationEvents = useMemo(
        () => selectRunnableGlobalEventsForTrigger(MIGRATION_TRIGGER),
        [],
    );
    const migrationEvents = useTypedSelector(selectMigrationEvents);
    const modifierContext = useTypedSelector(selectGlobalModifierApplyContext);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmingExodus, setIsConfirmingExodus] = useState(false);

    const handleExpandConfirm = () => {
        dispatch(expandCityRadius());
        setIsConfirming(false);
        sendNotification({
            title: "City Expanded",
            message: EXPAND_WARNING,
            scheme: "warning",
        });
    };

    const handleExodusConfirm = () => {
        dispatch(executeGlobalEvents(migrationEvents.map(event => ({
            eventId: event.id,
            actions: event.actions,
            modifierContext,
        }))));
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
