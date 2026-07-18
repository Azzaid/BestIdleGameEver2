import {useEffect, type CSSProperties} from "react";
import ResearchPage from "./ResearchPage.tsx";
import {DEVELOPMENT_VECTOR_LABELS} from "../../models/DevlopmentVector.ts";
import * as s from "./ResearchModal.css.ts";

const researchVectors = ["neutral", "tech", "nature", "medieval", "aether"] as const;

export default function ResearchModal({
  onClose,
  topInsetPx = 0,
}: {
  onClose: () => void;
  topInsetPx?: number;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <section
      className={s.backdrop}
      role="presentation"
      style={{"--research-modal-top-inset": `${topInsetPx}px`} as CSSProperties}
      onClick={onClose}
    >
      <article
        className={s.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={s.header}>
          <div className={s.headerText}>
            <p className={s.kicker}>Thoughtwork</p>
            <h1 id="research-modal-title" className={s.title}>Research</h1>
            <div className={s.vectorStrip} aria-label="Research vectors">
              {researchVectors.map(vector => (
                <span key={vector} className={`${s.vectorChip} ${s.vectorTone[vector]}`}>
                  {DEVELOPMENT_VECTOR_LABELS[vector]}
                </span>
              ))}
            </div>
          </div>
          <button
            className={s.closeButton}
            type="button"
            aria-label="Close research"
            title="Close research"
            onClick={onClose}
          >
            x
          </button>
        </header>
        <div className={s.body}>
          <ResearchPage />
        </div>
      </article>
    </section>
  );
}
