const eventImageModules = import.meta.glob("../../assets/events/*.{jpeg,jpg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export const GLOBAL_EVENT_IMAGE_OPTIONS = Object.entries(eventImageModules)
  .map(([path, src]) => {
    const id = getFileStem(path);

    return {
      id,
      label: titleFromId(id),
      src,
    };
  })
  .sort((left, right) => left.label.localeCompare(right.label));

export type GlobalEventImageId = string;

export const GLOBAL_EVENT_IMAGES: Record<GlobalEventImageId, string> = Object.fromEntries(
  GLOBAL_EVENT_IMAGE_OPTIONS.map(image => [image.id, image.src]),
) as Record<GlobalEventImageId, string>;

function getFileStem(path: string): string {
  return path.split("/").at(-1)?.replace(/\.(jpeg|jpg|png|webp)$/i, "") ?? path;
}

function titleFromId(id: string): string {
  return id
    .replace(/[_.-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}
