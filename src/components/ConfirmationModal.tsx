import * as s from "./ConfirmationModal.css.ts";

export function ConfirmationModal({
    title,
    message,
    confirmLabel,
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
}: {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className={s.backdrop} role="presentation" onClick={onCancel}>
            <div
                className={s.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 id="confirmation-modal-title" className={s.title}>{title}</h2>
                <p className={s.message}>{message}</p>
                <div className={s.actions}>
                    <button className={s.secondaryButton} type="button" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className={s.primaryButton} type="button" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
