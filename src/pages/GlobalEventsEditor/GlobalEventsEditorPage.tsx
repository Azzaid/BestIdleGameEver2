import {useEffect, useMemo, useState, type ChangeEvent, type DragEvent} from "react";
import type {
  GlobalEventAction,
  GlobalEventDefinition,
  GlobalEventTrigger,
  GlobalModifierDefinition,
} from "../../models/globalEvents.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {buildingIds, technologyIds} from "../../data/ids.ts";
import {HOMOGENEOUS_VALUE_DEFINITION_LIST} from "../../data/homogeneousValues/index.ts";
import {GLOBAL_EVENT_IMAGES, GLOBAL_EVENT_IMAGE_OPTIONS, type GlobalEventImageId} from "../../data/globalEvents/eventImages.ts";
import eventDefinitions from "../../data/globalEvents/events.json";
import modifierDefinitions from "../../data/globalModifiers/modifiers.json";
import * as s from "./GlobalEventsEditorPage.css.ts";

type EditorTab = "events" | "modifiers";
type TriggerType = GlobalEventTrigger["type"];
type ActionType = GlobalEventAction["type"];
type RequirementType = Requirement["type"];

type GlobalEventJsonDefinition = Omit<GlobalEventDefinition, "imageSrc"> & {
  imageId?: GlobalEventImageId;
};

type EventDraft = {
  id: string;
  title: string;
  description: string;
  imageId: "" | GlobalEventImageId;
  imageAlt: string;
  triggerType: TriggerType;
  triggerTarget: string;
  once: boolean;
  priority: string;
  requirements: RequirementRow[];
  blockRequirements: RequirementRow[];
  actions: ActionRow[];
};

type EventImageDraft = {
  file: File;
  previewUrl: string;
  imageId: GlobalEventImageId;
  previousImageId?: GlobalEventImageId;
};

type RequirementRow = {
  rowId: number;
  type: RequirementType;
  target: string;
  amount: string;
};

type ActionRow = {
  rowId: number;
  type: ActionType;
  target: string;
};

type ModifierDraft = {
  id: string;
  title: string;
  description: string;
  applyRulesJson: string;
  effectsJson: string;
};

type SaveStatus = {
  kind: "idle" | "saving" | "success" | "error";
  message: string;
};

const localDataServerUrl = "http://127.0.0.1:4317";
const defaultValueId = HOMOGENEOUS_VALUE_DEFINITION_LIST[0]?.id ?? "resource.people";
const triggerTypes: TriggerType[] = [
  "manual",
  "gameStarted",
  "requirementsMet",
  "cityAbandoned",
  "cityMigrated",
  "migration",
  "siegeEnded",
  "technologyUnlocked",
];
const requirementTypes: RequirementType[] = [
  "buildingKeywordExists",
  "buildingExists",
  "technologyUnlocked",
  "globalFlagExists",
  "globalFlagMissing",
  "homogeneousValueAtLeast",
  "homogeneousValueLessThan",
];
const actionTypes: ActionType[] = [
  "applyGlobalModifier",
  "abandonCity",
  "triggerEnding",
  "showCutscene",
  "unlockTechnology",
  "addFlag",
  "removeFlag",
];
const imageOptions: {value: "" | GlobalEventImageId; label: string}[] = [
  {value: "", label: "No image"},
  ...GLOBAL_EVENT_IMAGE_OPTIONS.map(image => ({value: image.id, label: image.label})),
];
const buildingIdOptions = buildingIds.map(id => ({value: id, label: id}));
const technologyIdOptions = technologyIds.map(id => ({value: id, label: id}));

let nextRowId = 1;

export default function GlobalEventsEditorPage() {
  const [activeTab, setActiveTab] = useState<EditorTab>("events");
  const [events, setEvents] = useState<GlobalEventJsonDefinition[]>(eventDefinitions as GlobalEventJsonDefinition[]);
  const [modifiers, setModifiers] = useState<GlobalModifierDefinition[]>(modifierDefinitions as GlobalModifierDefinition[]);
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "new_global_event");
  const [selectedModifierId, setSelectedModifierId] = useState(modifiers[0]?.id ?? "new_global_modifier");
  const [eventDraft, setEventDraft] = useState<EventDraft>(() => createEventDraft(events[0] ?? createNewEvent()));
  const [modifierDraft, setModifierDraft] = useState<ModifierDraft>(() => createModifierDraft(modifiers[0] ?? createNewModifier()));
  const [eventImageDraft, setEventImageDraft] = useState<EventImageDraft | null>(null);
  const [eventStatus, setEventStatus] = useState<SaveStatus>({kind: "idle", message: ""});
  const [modifierStatus, setModifierStatus] = useState<SaveStatus>({kind: "idle", message: ""});

  const selectedEvent = useMemo(
    () => events.find(event => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );
  const selectedModifier = useMemo(
    () => modifiers.find(modifier => modifier.id === selectedModifierId) ?? null,
    [modifiers, selectedModifierId],
  );
  const eventPreview = useMemo(() => createEventDefinition(eventDraft), [eventDraft]);
  const modifierPreview = useMemo(() => createModifierDefinition(modifierDraft), [modifierDraft]);
  const eventPreviewJson = useMemo(() => JSON.stringify(eventPreview, null, 2), [eventPreview]);
  const modifierPreviewJson = useMemo(() => JSON.stringify(modifierPreview.definition, null, 2), [modifierPreview.definition]);

  useEffect(() => {
    setEventImageDraft(currentDraft => {
      if (currentDraft) URL.revokeObjectURL(currentDraft.previewUrl);
      return null;
    });
    setEventDraft(createEventDraft(selectedEvent ?? createNewEvent(selectedEventId)));
    setEventStatus({kind: "idle", message: ""});
  }, [selectedEvent, selectedEventId]);

  useEffect(() => () => {
    if (eventImageDraft) URL.revokeObjectURL(eventImageDraft.previewUrl);
  }, [eventImageDraft]);

  useEffect(() => {
    setModifierDraft(createModifierDraft(selectedModifier ?? createNewModifier(selectedModifierId)));
    setModifierStatus({kind: "idle", message: ""});
  }, [selectedModifier, selectedModifierId]);

  return (
    <section className={s.page}>
      <aside className={s.sidebar}>
        <div className={s.header}>
          <h1 className={s.title}>Global Events</h1>
          <p className={s.subtitle}>Debug authoring for event flows and persistent modifiers.</p>
        </div>

        <div className={s.tabs}>
          <button className={activeTab === "events" ? s.activeButton : s.button} type="button" onClick={() => setActiveTab("events")}>
            Events
          </button>
          <button className={activeTab === "modifiers" ? s.activeButton : s.button} type="button" onClick={() => setActiveTab("modifiers")}>
            Modifiers
          </button>
        </div>

        {activeTab === "events" ? (
          <DefinitionList
            items={events}
            selectedId={selectedEventId}
            onSelect={setSelectedEventId}
            onCreate={() => {
              setEventImageDraft(currentDraft => {
                if (currentDraft) URL.revokeObjectURL(currentDraft.previewUrl);
                return null;
              });
              setSelectedEventId("new_global_event");
              setEventDraft(createEventDraft(createNewEvent()));
            }}
          />
        ) : (
          <DefinitionList
            items={modifiers}
            selectedId={selectedModifierId}
            onSelect={setSelectedModifierId}
            onCreate={() => {
              setSelectedModifierId("new_global_modifier");
              setModifierDraft(createModifierDraft(createNewModifier()));
            }}
          />
        )}
      </aside>

      <main className={s.content}>
        {activeTab === "events" ? (
          <EventEditor
            draft={eventDraft}
            modifierIds={modifiers.map(modifier => modifier.id)}
            imageDraft={eventImageDraft}
            previewJson={eventPreviewJson}
            status={eventStatus}
            onChange={patch => setEventDraft(current => ({...current, ...patch}))}
            onImageChange={setEventImageId}
            onDropImage={setEventImageFile}
            onRemoveImage={removeEventImage}
            onSave={saveEvent}
          />
        ) : (
          <ModifierEditor
            draft={modifierDraft}
            preview={modifierPreview}
            previewJson={modifierPreviewJson}
            status={modifierStatus}
            onChange={patch => setModifierDraft(current => ({...current, ...patch}))}
            onSave={saveModifier}
          />
        )}
      </main>
    </section>
  );

  async function saveEvent() {
    setEventStatus({kind: "saving", message: "Saving global event..."});

    try {
      const imageResult = eventImageDraft ? await uploadGlobalEventImage(eventImageDraft) : undefined;
      const response = await fetch(`${localDataServerUrl}/global-events`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(eventPreview),
      });
      const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

      if (!response.ok) {
        setEventStatus({kind: "error", message: responseBody?.error ?? `Save failed with status ${response.status}.`});
        return;
      }

      setEvents(current => upsertById(current, eventPreview));
      setSelectedEventId(eventPreview.id);
      setEventStatus({
        kind: "success",
        message: [
          `${responseBody?.action ?? "saved"} in ${responseBody?.file ?? "events.json"}`,
          imageResult?.action ? `image ${imageResult.action}` : "",
        ].filter(Boolean).join("; ") + ".",
      });
      if (eventImageDraft) URL.revokeObjectURL(eventImageDraft.previewUrl);
      setEventImageDraft(null);
    } catch (error) {
      setEventStatus({
        kind: "error",
        message: error instanceof Error
          ? error.message
          : "Could not reach local data server at http://127.0.0.1:4317.",
      });
    }
  }

  function setEventImageFile(file: File) {
    if (file.type !== "image/png") {
      setEventStatus({kind: "error", message: "Event pictures must be PNG files."});
      return;
    }

    if (eventImageDraft) URL.revokeObjectURL(eventImageDraft.previewUrl);

    const imageId = normalizeImageStem(eventDraft.id);
    setEventImageDraft({
      file,
      previewUrl: URL.createObjectURL(file),
      imageId,
      previousImageId: eventDraft.imageId || undefined,
    });
    setEventDraft(current => ({
      ...current,
      imageId,
      imageAlt: current.imageAlt || current.title,
    }));
    setEventStatus({kind: "idle", message: ""});
  }

  function removeEventImage() {
    if (eventImageDraft) URL.revokeObjectURL(eventImageDraft.previewUrl);
    setEventImageDraft(null);
    setEventDraft(current => ({...current, imageId: ""}));
  }

  function setEventImageId(imageId: EventDraft["imageId"]) {
    if (eventImageDraft) URL.revokeObjectURL(eventImageDraft.previewUrl);
    setEventImageDraft(null);
    setEventDraft(current => ({...current, imageId}));
  }

  async function saveModifier() {
    if (!modifierPreview.ok) {
      setModifierStatus({kind: "error", message: modifierPreview.error});
      return;
    }

    setModifierStatus({kind: "saving", message: "Saving global modifier..."});

    try {
      const response = await fetch(`${localDataServerUrl}/global-modifiers`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(modifierPreview.definition),
      });
      const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

      if (!response.ok) {
        setModifierStatus({kind: "error", message: responseBody?.error ?? `Save failed with status ${response.status}.`});
        return;
      }

      setModifiers(current => upsertById(current, modifierPreview.definition));
      setSelectedModifierId(modifierPreview.definition.id);
      setModifierStatus({kind: "success", message: `${responseBody?.action ?? "saved"} in ${responseBody?.file ?? "modifiers.json"}.`});
    } catch (error) {
      setModifierStatus({kind: "error", message: "Could not reach local data server at http://127.0.0.1:4317."});
    }
  }
}

function DefinitionList<T extends {id: string; title?: string}>({
  items,
  selectedId,
  onSelect,
  onCreate,
}: {
  items: readonly T[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <button className={s.button} type="button" onClick={onCreate}>New</button>
      <div className={s.list}>
        {items.map(item => (
          <button
            key={item.id}
            className={item.id === selectedId ? s.listItemActive : s.listItem}
            type="button"
            onClick={() => onSelect(item.id)}
          >
            <span className={s.listTitle}>{item.title ?? item.id}</span>
            <span className={s.listMeta}>{item.id}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function EventEditor({
  draft,
  modifierIds,
  imageDraft,
  previewJson,
  status,
  onChange,
  onImageChange,
  onDropImage,
  onRemoveImage,
  onSave,
}: {
  draft: EventDraft;
  modifierIds: readonly string[];
  imageDraft: EventImageDraft | null;
  previewJson: string;
  status: SaveStatus;
  onChange: (patch: Partial<EventDraft>) => void;
  onImageChange: (imageId: EventDraft["imageId"]) => void;
  onDropImage: (file: File) => void;
  onRemoveImage: () => void;
  onSave: () => void;
}) {
  const selectedImageSrc = imageDraft?.previewUrl ?? (draft.imageId ? GLOBAL_EVENT_IMAGES[draft.imageId] : undefined);
  const selectedImageLabel = imageDraft?.file.name ?? imageOptions.find(option => option.value === draft.imageId)?.label ?? draft.imageId;

  return (
    <>
      <div className={s.section}>
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>Event</h2>
          <label className={s.toggle}>
            <input type="checkbox" checked={draft.once} onChange={event => onChange({once: event.target.checked})} />
            Once
          </label>
        </div>
        <div className={s.grid}>
          <TextField label="ID" value={draft.id} onChange={value => onChange({id: normalizeId(value)})} />
          <TextField label="Title" value={draft.title} onChange={title => onChange({title})} />
          <label className={`${s.field} ${s.fullWidth}`}>
            <span className={s.label}>Description</span>
            <textarea className={s.textarea} value={draft.description} onChange={event => onChange({description: event.target.value})} />
          </label>
          <EventImageField
            imageId={draft.imageId}
            imageSrc={selectedImageSrc}
            imageLabel={selectedImageLabel}
            hasDraft={Boolean(imageDraft)}
            onChange={onImageChange}
            onDropFile={onDropImage}
            onRemove={onRemoveImage}
          />
          <TextField label="Image alt" value={draft.imageAlt} onChange={imageAlt => onChange({imageAlt})} />
        </div>
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Trigger</h2>
        <div className={s.grid}>
          <label className={s.field}>
            <span className={s.label}>Type</span>
            <select
              className={s.input}
              value={draft.triggerType}
              onChange={event => {
                const triggerType = event.target.value as TriggerType;
                onChange({
                  triggerType,
                  triggerTarget: draft.triggerTarget || getDefaultTriggerTarget(triggerType),
                });
              }}
            >
              {triggerTypes.map(type => <option key={type} value={type}>{formatLabel(type)}</option>)}
            </select>
          </label>
          {draft.triggerType === "technologyUnlocked" ? (
            <SearchableIdField
              id={`trigger-${draft.id}`}
              label={getTriggerTargetLabel(draft.triggerType)}
              value={draft.triggerTarget}
              options={technologyIdOptions}
              onChange={triggerTarget => onChange({triggerTarget})}
            />
          ) : (
            <TextField label={getTriggerTargetLabel(draft.triggerType)} value={draft.triggerTarget} onChange={triggerTarget => onChange({triggerTarget})} />
          )}
          <TextField label="Priority" value={draft.priority} type="number" onChange={priority => onChange({priority})} />
        </div>
      </div>

      <RequirementEditor title="Requirements" rows={draft.requirements} onChange={requirements => onChange({requirements})} />
      <RequirementEditor title="Blocking Requirements" rows={draft.blockRequirements} onChange={blockRequirements => onChange({blockRequirements})} />
      <ActionEditor rows={draft.actions} modifierIds={modifierIds} onChange={actions => onChange({actions})} />

      <PreviewAndSave previewJson={previewJson} status={status} onSave={onSave} />
    </>
  );
}

function EventImageField({
  imageId,
  imageSrc,
  imageLabel,
  hasDraft,
  onChange,
  onDropFile,
  onRemove,
}: {
  imageId: EventDraft["imageId"];
  imageSrc: string | undefined;
  imageLabel: string;
  hasDraft: boolean;
  onChange: (imageId: EventDraft["imageId"]) => void;
  onDropFile: (file: File) => void;
  onRemove: () => void;
}) {
  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onDropFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <section className={`${s.section} ${s.fullWidth}`}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Event Picture</h2>
      </div>
      <div className={s.imageAssetGrid}>
        <div className={s.field}>
          <span className={s.label}>Image</span>
          {imageSrc ? (
            <div
              className={s.imageCard}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                handleFiles(event.dataTransfer.files);
              }}
            >
              <img className={s.imageThumb} src={imageSrc} alt={imageLabel} />
              <button className={s.imageRemoveButton} type="button" onClick={onRemove} title="Remove picture">x</button>
              <span className={s.imageCaption}>{hasDraft ? "Pending replacement" : imageId}</span>
              <label className={s.imageReplaceButton}>
                Replace
                <input className={s.fileInput} type="file" accept="image/png" onChange={onFileChange} />
              </label>
            </div>
          ) : (
            <label
              className={s.imageDropZone}
              onDragOver={event => event.preventDefault()}
              onDrop={onDrop}
            >
              <input className={s.fileInput} type="file" accept="image/png" onChange={onFileChange} />
              <span className={s.imageDropTitle}>Drop PNG picture</span>
              <span className={s.hint}>or click to choose a file</span>
            </label>
          )}
          <label className={s.field}>
            <span className={s.label}>Existing Image</span>
            <select className={s.input} value={imageId} onChange={event => onChange(event.target.value as EventDraft["imageId"])}>
              {imageOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
        <div className={s.imagePreviewBox}>
          {imageSrc ? (
            <img className={s.imagePreview} src={imageSrc} alt={imageLabel} />
          ) : (
            <span className={s.hint}>Drop a PNG or choose an existing picture.</span>
          )}
        </div>
      </div>
    </section>
  );
}

function ModifierEditor({
  draft,
  preview,
  previewJson,
  status,
  onChange,
  onSave,
}: {
  draft: ModifierDraft;
  preview: ModifierPreview;
  previewJson: string;
  status: SaveStatus;
  onChange: (patch: Partial<ModifierDraft>) => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className={s.section}>
        <h2 className={s.sectionTitle}>Modifier</h2>
        <div className={s.grid}>
          <TextField label="ID" value={draft.id} onChange={value => onChange({id: normalizeId(value)})} />
          <TextField label="Title" value={draft.title} onChange={title => onChange({title})} />
          <label className={`${s.field} ${s.fullWidth}`}>
            <span className={s.label}>Description</span>
            <textarea className={s.textarea} value={draft.description} onChange={event => onChange({description: event.target.value})} />
          </label>
        </div>
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Apply Rules</h2>
        <textarea className={s.jsonTextarea} value={draft.applyRulesJson} onChange={event => onChange({applyRulesJson: event.target.value})} />
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Generated Effects</h2>
        <textarea className={s.jsonTextarea} value={draft.effectsJson} onChange={event => onChange({effectsJson: event.target.value})} />
        {!preview.ok && <span className={s.errorText}>{preview.error}</span>}
      </div>

      <PreviewAndSave previewJson={previewJson} status={status} onSave={onSave} disabled={!preview.ok} />
    </>
  );
}

function RequirementEditor({
  title,
  rows,
  onChange,
}: {
  title: string;
  rows: RequirementRow[];
  onChange: (rows: RequirementRow[]) => void;
}) {
  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>{title}</h2>
        <button className={s.button} type="button" onClick={() => onChange([...rows, createRequirementRow()])}>Add</button>
      </div>
      <div className={s.rowList}>
        {rows.length === 0 && <span className={s.hint}>No requirements.</span>}
        {rows.map(row => (
          <div key={row.rowId} className={s.row}>
            <label className={s.field}>
              <span className={s.label}>Type</span>
              <select
                className={s.input}
                value={row.type}
                onChange={event => {
                  const nextType = event.target.value as RequirementType;
                  updateRequirement(row.rowId, {
                    type: nextType,
                    target: row.target || getDefaultRequirementTarget(nextType),
                  });
                }}
              >
                {requirementTypes.map(type => <option key={type} value={type}>{formatLabel(type)}</option>)}
              </select>
            </label>
            {row.type === "buildingExists" ? (
              <SearchableIdField
                id={`requirement-${row.rowId}`}
                label={getRequirementTargetLabel(row.type)}
                value={row.target}
                options={buildingIdOptions}
                onChange={target => updateRequirement(row.rowId, {target})}
              />
            ) : row.type === "technologyUnlocked" ? (
              <SearchableIdField
                id={`requirement-${row.rowId}`}
                label={getRequirementTargetLabel(row.type)}
                value={row.target}
                options={technologyIdOptions}
                onChange={target => updateRequirement(row.rowId, {target})}
              />
            ) : (
              <TextField label={getRequirementTargetLabel(row.type)} value={row.target} onChange={target => updateRequirement(row.rowId, {target})} />
            )}
            <TextField label="Amount" value={row.amount} type="number" onChange={amount => updateRequirement(row.rowId, {amount})} />
            <button className={s.button} type="button" onClick={() => onChange(rows.filter(item => item.rowId !== row.rowId))}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );

  function updateRequirement(rowId: number, patch: Partial<RequirementRow>) {
    onChange(rows.map(row => row.rowId === rowId ? {...row, ...patch} : row));
  }
}

function ActionEditor({
  rows,
  modifierIds,
  onChange,
}: {
  rows: ActionRow[];
  modifierIds: readonly string[];
  onChange: (rows: ActionRow[]) => void;
}) {
  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Actions</h2>
        <button className={s.button} type="button" onClick={() => onChange([...rows, createActionRow()])}>Add</button>
      </div>
      <div className={s.rowList}>
        {rows.length === 0 && <span className={s.hint}>No actions.</span>}
        {rows.map(row => (
          <div key={row.rowId} className={s.actionRow}>
            <label className={s.field}>
              <span className={s.label}>Type</span>
              <select
                className={s.input}
                value={row.type}
                onChange={event => {
                  const nextType = event.target.value as ActionType;
                  updateAction(row.rowId, {
                    type: nextType,
                    target: row.target || getDefaultActionTarget(nextType, modifierIds),
                  });
                }}
              >
                {actionTypes.map(type => <option key={type} value={type}>{formatLabel(type)}</option>)}
              </select>
            </label>
            {row.type === "applyGlobalModifier" && modifierIds.length > 0 ? (
              <label className={s.field}>
                <span className={s.label}>Modifier ID</span>
                <select className={s.input} value={row.target} onChange={event => updateAction(row.rowId, {target: event.target.value})}>
                  {modifierIds.map(modifierId => <option key={modifierId} value={modifierId}>{modifierId}</option>)}
                </select>
              </label>
            ) : row.type === "unlockTechnology" ? (
              <SearchableIdField
                id={`action-${row.rowId}`}
                label={getActionTargetLabel(row.type)}
                value={row.target}
                options={technologyIdOptions}
                onChange={target => updateAction(row.rowId, {target})}
              />
            ) : (
              <TextField label={getActionTargetLabel(row.type)} value={row.target} onChange={target => updateAction(row.rowId, {target})} />
            )}
            <button className={s.button} type="button" onClick={() => onChange(rows.filter(item => item.rowId !== row.rowId))}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );

  function updateAction(rowId: number, patch: Partial<ActionRow>) {
    onChange(rows.map(row => row.rowId === rowId ? {...row, ...patch} : row));
  }
}

function TextField({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: "text" | "number";
  onChange: (value: string) => void;
}) {
  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>
      <input className={s.input} type={type} value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function SearchableIdField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly {value: string; label: string}[];
  onChange: (value: string) => void;
}) {
  const listId = `${id}-options`;

  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>
      <input
        className={s.input}
        list={listId}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </datalist>
    </label>
  );
}

function PreviewAndSave({
  previewJson,
  status,
  disabled = false,
  onSave,
}: {
  previewJson: string;
  status: SaveStatus;
  disabled?: boolean;
  onSave: () => void;
}) {
  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Generated JSON</h2>
        <div className={s.saveRow}>
          {status.message && <span className={status.kind === "error" ? s.errorText : s.statusText}>{status.message}</span>}
          <button className={s.activeButton} type="button" disabled={disabled || status.kind === "saving"} onClick={onSave}>Save</button>
        </div>
      </div>
      <pre className={s.preview}>{previewJson}</pre>
    </div>
  );
}

function createEventDraft(definition: GlobalEventJsonDefinition): EventDraft {
  return {
    id: definition.id,
    title: definition.title,
    description: definition.description ?? "",
    imageId: definition.imageId ?? "",
    imageAlt: definition.imageAlt ?? "",
    triggerType: definition.trigger.type,
    triggerTarget: getTriggerTarget(definition.trigger),
    once: definition.once ?? false,
    priority: String(definition.priority ?? 0),
    requirements: (definition.requirements ?? definition.requirement ?? []).map(createRequirementRowFromRequirement),
    blockRequirements: (definition.blockRequirements ?? definition.blockRequirement ?? []).map(createRequirementRowFromRequirement),
    actions: definition.actions.map(createActionRowFromAction),
  };
}

function createModifierDraft(definition: GlobalModifierDefinition): ModifierDraft {
  return {
    id: definition.id,
    title: definition.title,
    description: definition.description ?? "",
    applyRulesJson: JSON.stringify(definition.applyRules, null, 2),
    effectsJson: JSON.stringify(definition.effects, null, 2),
  };
}

function createEventDefinition(draft: EventDraft): GlobalEventJsonDefinition {
  const definition: GlobalEventJsonDefinition = {
    id: draft.id.trim() || "new_global_event",
    title: draft.title.trim() || "New Global Event",
    trigger: createTrigger(draft.triggerType, draft.triggerTarget),
    once: draft.once,
    priority: Number.parseFloat(draft.priority) || 0,
    actions: draft.actions.map(createAction),
  };

  if (draft.description.trim()) definition.description = draft.description.trim();
  if (draft.imageId) definition.imageId = draft.imageId;
  if (draft.imageAlt.trim()) definition.imageAlt = draft.imageAlt.trim();
  if (draft.requirements.length) definition.requirements = draft.requirements.map(createRequirement);
  if (draft.blockRequirements.length) definition.blockRequirements = draft.blockRequirements.map(createRequirement);

  return definition;
}

type ModifierPreview =
  | {ok: true; definition: GlobalModifierDefinition}
  | {ok: false; definition: GlobalModifierDefinition; error: string};

function createModifierDefinition(draft: ModifierDraft): ModifierPreview {
  const fallbackDefinition: GlobalModifierDefinition = {
    id: draft.id.trim() || "new_global_modifier",
    title: draft.title.trim() || "New Global Modifier",
    description: draft.description.trim() || undefined,
    applyRules: [],
    effects: [],
  };

  try {
    const applyRules = JSON.parse(draft.applyRulesJson) as GlobalModifierDefinition["applyRules"];
    const effects = JSON.parse(draft.effectsJson) as GlobalModifierDefinition["effects"];

    if (!Array.isArray(applyRules) || !Array.isArray(effects)) {
      return {
        ok: false,
        definition: fallbackDefinition,
        error: "Apply rules and effects must both be JSON arrays.",
      };
    }

    return {
      ok: true,
      definition: {
        ...fallbackDefinition,
        applyRules,
        effects,
      },
    };
  } catch (error) {
    return {
      ok: false,
      definition: fallbackDefinition,
      error: "Modifier JSON must be valid.",
    };
  }
}

async function uploadGlobalEventImage(draft: EventImageDraft): Promise<{action?: string; file?: string}> {
  const formData = new FormData();
  formData.append("fileStem", draft.imageId);
  if (draft.previousImageId && draft.previousImageId !== draft.imageId) {
    formData.append("previousFileStem", draft.previousImageId);
  }
  formData.append("image", draft.file, draft.file.name);

  const response = await fetch(`${localDataServerUrl}/global-event-images`, {
    method: "POST",
    body: formData,
  });
  const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

  if (!response.ok) {
    throw new Error(responseBody?.error ?? `Image upload failed with status ${response.status}.`);
  }

  return responseBody ?? {};
}

function createNewEvent(id = "new_global_event"): GlobalEventJsonDefinition {
  return {
    id,
    title: "New Global Event",
    trigger: {type: "manual"},
    once: true,
    priority: 0,
    actions: [],
  };
}

function createNewModifier(id = "new_global_modifier"): GlobalModifierDefinition {
  return {
    id,
    title: "New Global Modifier",
    applyRules: [],
    effects: [],
  };
}

function createTrigger(type: TriggerType, target: string): GlobalEventTrigger {
  if (type === "manual") return target.trim() ? {type, triggerId: target.trim()} : {type};
  if (type === "technologyUnlocked") return target.trim() ? {type, technologyId: target.trim()} : {type};

  return {type};
}

function getTriggerTarget(trigger: GlobalEventTrigger): string {
  if (trigger.type === "manual") return trigger.triggerId ?? "";
  if (trigger.type === "technologyUnlocked") return trigger.technologyId ?? "";
  return "";
}

function createRequirement(row: RequirementRow): Requirement {
  const amount = Number.parseFloat(row.amount) || 0;
  const target = row.target.trim();

  if (row.type === "buildingKeywordExists") return {type: row.type, keyword: target};
  if (row.type === "buildingExists") return {type: row.type, buildingId: target};
  if (row.type === "technologyUnlocked") return {type: row.type, technologyId: target};
  if (row.type === "globalFlagExists" || row.type === "globalFlagMissing") return {type: row.type, flagId: target};
  return {type: row.type, valueId: target || defaultValueId, amount};
}

function createRequirementRowFromRequirement(requirement: Requirement): RequirementRow {
  if (requirement.type === "buildingKeywordExists") return createRequirementRow(requirement.type, requirement.keyword);
  if (requirement.type === "buildingExists") return createRequirementRow(requirement.type, requirement.buildingId);
  if (requirement.type === "technologyUnlocked") return createRequirementRow(requirement.type, requirement.technologyId);
  if (requirement.type === "globalFlagExists" || requirement.type === "globalFlagMissing") return createRequirementRow(requirement.type, requirement.flagId);
  return createRequirementRow(requirement.type, requirement.valueId, String(requirement.amount));
}

function createRequirementRow(type: RequirementType = "globalFlagExists", target = "", amount = "0"): RequirementRow {
  return {
    rowId: nextRowId++,
    type,
    target,
    amount,
  };
}

function createAction(row: ActionRow): GlobalEventAction {
  const target = row.target.trim();

  if (row.type === "applyGlobalModifier") return {type: row.type, modifierId: target};
  if (row.type === "triggerEnding") return {type: row.type, endingId: target};
  if (row.type === "showCutscene") return {type: row.type, cutsceneId: target};
  if (row.type === "unlockTechnology") return {type: row.type, technologyId: target};
  if (row.type === "addFlag" || row.type === "removeFlag") return {type: row.type, flagId: target};
  return {type: row.type};
}

function createActionRowFromAction(action: GlobalEventAction): ActionRow {
  if (action.type === "applyGlobalModifier") return createActionRow(action.type, action.modifierId);
  if (action.type === "triggerEnding") return createActionRow(action.type, action.endingId);
  if (action.type === "showCutscene") return createActionRow(action.type, action.cutsceneId);
  if (action.type === "unlockTechnology") return createActionRow(action.type, action.technologyId);
  if (action.type === "addFlag" || action.type === "removeFlag") return createActionRow(action.type, action.flagId);
  return createActionRow(action.type);
}

function createActionRow(type: ActionType = "addFlag", target = ""): ActionRow {
  return {
    rowId: nextRowId++,
    type,
    target,
  };
}

function getTriggerTargetLabel(type: TriggerType): string {
  if (type === "manual") return "Trigger ID";
  if (type === "technologyUnlocked") return "Technology ID";
  return "Target";
}

function getDefaultTriggerTarget(type: TriggerType): string {
  if (type === "technologyUnlocked") return technologyIds[0] ?? "";
  return "";
}

function getRequirementTargetLabel(type: RequirementType): string {
  if (type === "buildingKeywordExists") return "Keyword";
  if (type === "buildingExists") return "Building ID";
  if (type === "technologyUnlocked") return "Technology ID";
  if (type === "homogeneousValueAtLeast" || type === "homogeneousValueLessThan") return "Value ID";
  return "Flag ID";
}

function getDefaultRequirementTarget(type: RequirementType): string {
  if (type === "buildingExists") return buildingIds[0] ?? "";
  if (type === "technologyUnlocked") return technologyIds[0] ?? "";
  if (type === "homogeneousValueAtLeast" || type === "homogeneousValueLessThan") return defaultValueId;
  return "";
}

function getActionTargetLabel(type: ActionType): string {
  if (type === "applyGlobalModifier") return "Modifier ID";
  if (type === "triggerEnding") return "Ending ID";
  if (type === "showCutscene") return "Cutscene ID";
  if (type === "unlockTechnology") return "Technology ID";
  if (type === "addFlag" || type === "removeFlag") return "Flag ID";
  return "Target";
}

function getDefaultActionTarget(type: ActionType, modifierIds: readonly string[]): string {
  if (type === "applyGlobalModifier") return modifierIds[0] ?? "";
  if (type === "unlockTechnology") return technologyIds[0] ?? "";
  return "";
}

function formatLabel(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, character => character.toUpperCase());
}

function normalizeId(value: string): string {
  return value.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9._-]/g, "");
}

function normalizeImageStem(value: string): string {
  const normalized = normalizeId(value).replace(/[.]+/g, "_");
  return normalized || "new_global_event";
}

function upsertById<T extends {id: string}>(items: readonly T[], nextItem: T): T[] {
  const existingIndex = items.findIndex(item => item.id === nextItem.id);
  if (existingIndex === -1) return [...items, nextItem];

  return items.map(item => item.id === nextItem.id ? nextItem : item);
}
