import cityTopDownCircularMap from "../../assets/events/cityTopDownCircularMap.jpeg";

export const GLOBAL_EVENT_IMAGE_OPTIONS = [
  {
    id: "cityTopDownCircularMap",
    label: "Circular city map",
    src: cityTopDownCircularMap,
  },
] as const;

export type GlobalEventImageId = typeof GLOBAL_EVENT_IMAGE_OPTIONS[number]["id"];

export const GLOBAL_EVENT_IMAGES: Record<GlobalEventImageId, string> = Object.fromEntries(
  GLOBAL_EVENT_IMAGE_OPTIONS.map(image => [image.id, image.src]),
) as Record<GlobalEventImageId, string>;
