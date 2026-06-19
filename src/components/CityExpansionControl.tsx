import {useState} from "react";
import {sendNotification} from "../lib/notifications/eventBus.ts";
import {expandCityRadius} from "../store/city/slice.ts";
import {useTypedDispatch, useTypedSelector} from "../store/hooks.ts";
import {selectCitySignatureStatus} from "../store/upkeep/selectors.ts";
import {ConfirmationModal} from "./ConfirmationModal.tsx";
import * as s from "./CityExpansionControl.css.ts";

const EXPAND_BLOCK_REASON = "The city is besieged. Raise controlled territory in battle before expanding.";
const EXPAND_WARNING = "City grows bigger, more noticeable and attracts more monsters";

export function CityExpansionControl() {
    const dispatch = useTypedDispatch();
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = () => {
        dispatch(expandCityRadius());
        setIsConfirming(false);
        sendNotification({
            title: "City Expanded",
            message: EXPAND_WARNING,
            scheme: "warning",
        });
    };

    return (
        <>
            <button
                className={s.expandButton}
                type="button"
                disabled={signatureStatus.isBesieged}
                title={signatureStatus.isBesieged ? EXPAND_BLOCK_REASON : undefined}
                onClick={() => setIsConfirming(true)}
            >
                Expand City
            </button>
            {isConfirming && (
                <ConfirmationModal
                    title="Expand City?"
                    message={EXPAND_WARNING}
                    confirmLabel="Expand"
                    onCancel={() => setIsConfirming(false)}
                    onConfirm={handleConfirm}
                />
            )}
        </>
    );
}
