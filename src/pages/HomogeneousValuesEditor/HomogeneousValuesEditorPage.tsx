import {useEffect, useMemo, useState} from "react";
import {
  HOMOGENEOUS_VALUE_DEFINITION_LIST,
} from "../../data/homogeneousValues/index.ts";
import {
  HOMOGENEOUS_VALUE_DISPLAY_METHODS,
  HOMOGENEOUS_VALUE_RESOLVE_TYPES,
  HOMOGENEOUS_VALUE_ROUNDING_METHODS,
  type HomogeneousValueDefinition,
  type HomogeneousValueDisplayMethod,
  type HomogeneousValueResolveType,
  type HomogeneousValueRoundingMethod,
} from "../../models/homogeneousValues.ts";
import * as s from "./HomogeneousValuesEditorPage.css.ts";

type DefinitionDraft = {
  id: string;
  label: string;
  keywords: string;
  displayMethod: HomogeneousValueDisplayMethod;
  resolutionMethod: HomogeneousValueResolveType;
  roundingMethod: HomogeneousValueRoundingMethod;
  diminishingReturnPower: string;
  initialValue: string;
};

type SaveStatus = {
  kind: "idle" | "saving" | "success" | "error";
  message: string;
};

const localDataServerUrl = "http://127.0.0.1:4317";

export default function HomogeneousValuesEditorPage() {
  const [definitions, setDefinitions] = useState<HomogeneousValueDefinition[]>(
    () => [...HOMOGENEOUS_VALUE_DEFINITION_LIST],
  );
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(definitions[0]?.id ?? "");
  const [draft, setDraft] = useState<DefinitionDraft>(() => createDraft(definitions[0]));
  const [status, setStatus] = useState<SaveStatus>({kind: "idle", message: ""});

  const selectedDefinition = useMemo(
    () => definitions.find(definition => definition.id === selectedId) ?? definitions[0],
    [definitions, selectedId],
  );
  const preview = useMemo(() => createDefinition(draft), [draft]);
  const previewJson = useMemo(() => JSON.stringify(preview, null, 2), [preview]);
  const validationError = useMemo(() => getValidationError(draft), [draft]);
  const keywordOptions = useMemo(() => Array.from(new Set(
    definitions.flatMap(definition => definition.keywords),
  )).sort(), [definitions]);
  const filteredDefinitions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return definitions;

    return definitions.filter(definition => [
      definition.id,
      definition.label,
      definition.displayMethod,
      definition.resolutionMethod ?? "sum",
      definition.roundingMethod ?? "twoDigitsAfterZero",
      ...definition.keywords,
    ].some(value => value.toLowerCase().includes(query)));
  }, [definitions, search]);

  useEffect(() => {
    if (!selectedDefinition) return;
    setDraft(createDraft(selectedDefinition));
    setStatus({kind: "idle", message: ""});
  }, [selectedDefinition]);

  return (
    <section className={s.page}>
      <aside className={s.sidebar}>
        <header className={s.header}>
          <h1 className={s.title}>Homogeneous Values</h1>
          <p className={s.subtitle}>Debug editing for the shared value registry.</p>
        </header>

        <label className={s.field}>
          <span className={s.label}>Search</span>
          <input
            className={s.input}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="id, label, keyword"
          />
        </label>

        <div className={s.list}>
          {filteredDefinitions.map(definition => (
            <button
              key={definition.id}
              className={definition.id === selectedId ? s.listItemActive : s.listItem}
              type="button"
              onClick={() => setSelectedId(definition.id)}
            >
              <span className={s.listTitle}>{definition.label}</span>
              <span className={s.listMeta}>{definition.id}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className={s.content}>
        <section className={s.section}>
          <div className={s.sectionHeader}>
            <div>
              <h2 className={s.sectionTitle}>Definition</h2>
              <p className={s.sectionMeta}>{draft.id}</p>
            </div>
            <button
              className={s.activeButton}
              type="button"
              disabled={status.kind === "saving" || Boolean(validationError)}
              onClick={saveDefinition}
            >
              Save
            </button>
          </div>

          <div className={s.grid}>
            <label className={s.field}>
              <span className={s.label}>ID</span>
              <input className={s.input} value={draft.id} readOnly />
            </label>
            <TextField label="Label" value={draft.label} onChange={label => updateDraft({label})} />
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Keywords</span>
              <input
                className={s.input}
                list="homogeneous-keywords"
                value={draft.keywords}
                onChange={event => updateDraft({keywords: event.target.value})}
              />
              <datalist id="homogeneous-keywords">
                {keywordOptions.map(keyword => <option key={keyword} value={keyword} />)}
              </datalist>
            </label>
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Resolution</h2>
          <div className={s.grid}>
            <SelectField
              label="Display"
              value={draft.displayMethod}
              options={HOMOGENEOUS_VALUE_DISPLAY_METHODS}
              onChange={displayMethod => updateDraft({displayMethod})}
            />
            <SelectField
              label="Resolution"
              value={draft.resolutionMethod}
              options={HOMOGENEOUS_VALUE_RESOLVE_TYPES}
              onChange={resolutionMethod => updateDraft({
                resolutionMethod,
                diminishingReturnPower: resolutionMethod === "diminishingReturn"
                  ? draft.diminishingReturnPower || "0.8"
                  : draft.diminishingReturnPower,
              })}
            />
            <SelectField
              label="Rounding"
              value={draft.roundingMethod}
              options={HOMOGENEOUS_VALUE_ROUNDING_METHODS}
              onChange={roundingMethod => updateDraft({roundingMethod})}
            />
            <TextField
              label="Initial value"
              value={draft.initialValue}
              type="number"
              onChange={initialValue => updateDraft({initialValue})}
            />
            {draft.resolutionMethod === "diminishingReturn" && (
              <TextField
                label="Diminishing power"
                value={draft.diminishingReturnPower}
                type="number"
                onChange={diminishingReturnPower => updateDraft({diminishingReturnPower})}
              />
            )}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Generated Definition</h2>
            <div className={s.statusRow}>
              {validationError && <span className={s.errorText}>{validationError}</span>}
              {status.message && <span className={status.kind === "error" ? s.errorText : s.statusText}>{status.message}</span>}
            </div>
          </div>
          <pre className={s.preview}>{previewJson}</pre>
        </section>
      </main>
    </section>
  );

  function updateDraft(patch: Partial<DefinitionDraft>) {
    setDraft(current => ({...current, ...patch}));
    setStatus({kind: "idle", message: ""});
  }

  async function saveDefinition() {
    const error = getValidationError(draft);
    if (error) {
      setStatus({kind: "error", message: error});
      return;
    }

    setStatus({kind: "saving", message: "Saving value definition..."});

    try {
      const response = await fetch(`${localDataServerUrl}/homogeneous-values`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(preview),
      });
      const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

      if (!response.ok) {
        setStatus({kind: "error", message: responseBody?.error ?? `Save failed with status ${response.status}.`});
        return;
      }

      setDefinitions(current => current.map(definition => definition.id === preview.id ? preview : definition));
      setStatus({kind: "success", message: `${responseBody?.action ?? "saved"} in ${responseBody?.file ?? "homogeneousValues/index.ts"}.`});
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error
          ? error.message
          : "Could not reach local data server at http://127.0.0.1:4317.",
      });
    }
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

function SelectField<TValue extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: TValue;
  options: readonly TValue[];
  onChange: (value: TValue) => void;
}) {
  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>
      <select className={s.input} value={value} onChange={event => onChange(event.target.value as TValue)}>
        {options.map(option => <option key={option} value={option}>{formatLabel(option)}</option>)}
      </select>
    </label>
  );
}

function createDraft(definition: HomogeneousValueDefinition | undefined): DefinitionDraft {
  return {
    id: definition?.id ?? "",
    label: definition?.label ?? "",
    keywords: definition?.keywords.join(", ") ?? "",
    displayMethod: definition?.displayMethod ?? "default",
    resolutionMethod: definition?.resolutionMethod ?? "sum",
    roundingMethod: definition?.roundingMethod ?? "twoDigitsAfterZero",
    diminishingReturnPower: stringifyOptionalNumber(definition?.diminishingReturnPower),
    initialValue: String(definition?.initialValue ?? 0),
  };
}

function createDefinition(draft: DefinitionDraft): HomogeneousValueDefinition {
  const definition: HomogeneousValueDefinition = {
    id: draft.id,
    label: draft.label.trim() || draft.id,
    keywords: parseKeywords(draft.keywords),
    displayMethod: draft.displayMethod,
    initialValue: parseNumber(draft.initialValue, 0),
  };

  if (draft.resolutionMethod !== "sum") {
    definition.resolutionMethod = draft.resolutionMethod;
  }

  if (draft.resolutionMethod === "diminishingReturn") {
    definition.diminishingReturnPower = parseNumber(draft.diminishingReturnPower, 1);
  }

  if (draft.roundingMethod !== "twoDigitsAfterZero") {
    definition.roundingMethod = draft.roundingMethod;
  }

  return definition;
}

function getValidationError(draft: DefinitionDraft): string {
  if (!draft.id.trim()) return "ID is required.";
  if (!draft.label.trim()) return "Label is required.";
  if (parseKeywords(draft.keywords).length === 0) return "At least one keyword is required.";
  if (!Number.isFinite(Number(draft.initialValue))) return "Initial value must be numeric.";

  if (draft.resolutionMethod === "diminishingReturn") {
    const power = Number(draft.diminishingReturnPower);
    if (!Number.isFinite(power) || power <= 0) return "Diminishing power must be a positive number.";
  }

  return "";
}

function parseKeywords(value: string): string[] {
  return value
    .split(",")
    .map(keyword => keyword.trim())
    .filter(Boolean);
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringifyOptionalNumber(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

function formatLabel(value: string): string {
  if (value === "twoDigitsAfterZero") return "Two digits";
  return value.replace(/([A-Z])/g, " $1").replace(/^./, character => character.toUpperCase());
}
