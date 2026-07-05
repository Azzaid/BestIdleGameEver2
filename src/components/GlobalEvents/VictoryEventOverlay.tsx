import type {CSSProperties} from "react";
import {useNavigate} from "react-router-dom";
import {GLOBAL_EVENTS} from "../../data/globalEvents/index.ts";
import {clearPendingVictoryEvent} from "../../store/globalEvents/slice.ts";
import {selectPendingVictoryEvent} from "../../store/globalEvents/selectors.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import * as s from "./VictoryEventOverlay.css.ts";

export function VictoryEventOverlay() {
  const dispatch = useTypedDispatch();
  const navigate = useNavigate();
  const pendingVictoryEvent = useTypedSelector(selectPendingVictoryEvent);
  if (!pendingVictoryEvent) return null;

  const event = GLOBAL_EVENTS[pendingVictoryEvent.eventId];
  const title = event?.title ?? "Victory";
  const description = event?.description ?? "A decisive victory has been achieved.";

  const close = () => {
    dispatch(clearPendingVictoryEvent());
  };

  const openHistory = () => {
    close();
    navigate("/history");
  };

  return (
    <section className={s.backdrop} role="dialog" aria-modal="true" aria-labelledby="victory-event-title">
      <div className={s.vfxLayer} aria-hidden>
        {Array.from({length: 18}, (_, index) => (
          <span
            className={s.spark}
            style={{
              "--spark-angle": `${index * 20}deg`,
              "--spark-delay": `${index * -90}ms`,
            } as CSSProperties}
            key={index}
          />
        ))}
      </div>
      <div className={s.rays} aria-hidden />
      <article className={s.panel}>
        <p className={s.kicker}>Victory Event</p>
        <h1 id="victory-event-title" className={s.title}>{title}</h1>
        {event?.imageSrc && (
          <img className={s.image} src={event.imageSrc} alt={event.imageAlt ?? title} />
        )}
        <p className={s.description}>{description}</p>
        {event?.hint && <p className={s.hint}>{event.hint}</p>}
        <div className={s.actions}>
          <button className={s.primaryButton} type="button" onClick={openHistory}>Open History</button>
          <button className={s.secondaryButton} type="button" onClick={close}>Continue</button>
        </div>
      </article>
    </section>
  );
}
