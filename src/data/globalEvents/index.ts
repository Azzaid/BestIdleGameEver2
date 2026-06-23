import type {GlobalEventDefinition} from "../../models/globalEvents.ts";
import {GLOBAL_EVENT_IMAGES, type GlobalEventImageId} from "./eventImages.ts";
import globalEventDefinitions from "./events.json";

type GlobalEventJsonDefinition = Omit<GlobalEventDefinition, "imageSrc"> & {
  imageId?: GlobalEventImageId;
};

export const GLOBAL_EVENTS: Record<string, GlobalEventDefinition> = Object.fromEntries(
  (globalEventDefinitions as GlobalEventJsonDefinition[]).map(({imageId, ...definition}) => {
    const imageSrc = imageId ? GLOBAL_EVENT_IMAGES[imageId] : undefined;

    return [
      definition.id,
      {
        ...definition,
        imageSrc,
      },
    ];
  }),
);

export const GLOBAL_EVENT_LIST = Object.values(GLOBAL_EVENTS);
