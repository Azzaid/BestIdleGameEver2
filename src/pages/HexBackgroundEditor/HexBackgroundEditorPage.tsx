import {useMemo, useState, type ChangeEvent, type FormEvent} from "react";
import {
  CITY_HEX_BACKGROUND_SPRITES,
  type CityBiome,
  type CityHexBackgroundType,
} from "../../data/cityHexBackgrounds.ts";
import {CITY_BIOME_LABELS, CITY_BIOMES, CITY_HEX_BACKGROUND_TYPES} from "../../models/city/hexBackgrounds.ts";
import type {DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {
  selectHexBackgroundEditorFilters,
  selectHexBackgroundEditorUpload,
} from "../../store/hexBackgroundEditor/selectors.ts";
import {
  setHexBackgroundEditorFilters,
  setHexBackgroundUploadSelection,
} from "../../store/hexBackgroundEditor/slice.ts";
import type {HexBackgroundEditorFilters} from "../../models/store/hexBackgroundEditor.ts";
import * as s from "./HexBackgroundEditorPage.css.ts";

const localDataServerUrl = "http://127.0.0.1:4317";
const terrainTypes = Object.values(CITY_HEX_BACKGROUND_TYPES);
const biomes = Object.values(CITY_BIOMES);
const vectors = ["tech", "nature", "medieval", "aether"] as const satisfies readonly DevelopmentVectorKey[];

type UploadState = {
  fileStem: string;
  file: File | null;
};

export default function HexBackgroundEditorPage() {
  const dispatch = useTypedDispatch();
  const uploadSelection = useTypedSelector(selectHexBackgroundEditorUpload);
  const filters = useTypedSelector(selectHexBackgroundEditorFilters);
  const [upload, setUpload] = useState<UploadState>({
    fileStem: "",
    file: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => (
    CITY_HEX_BACKGROUND_SPRITES.filter(sprite => {
      const query = filters.query.trim().toLowerCase();
      if (query && !sprite.id.toLowerCase().includes(query)) return false;
      if (filters.type && sprite.type !== filters.type) return false;
      if (filters.biome && sprite.biome !== filters.biome) return false;
      if (filters.vector && sprite.vector !== filters.vector) return false;

      return true;
    })
  ), [filters]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUpload(current => ({
      ...current,
      file,
      fileStem: current.fileStem || normalizeFileStem(file?.name ?? ""),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!upload.file) {
      setError("Choose a PNG file first.");
      return;
    }

    if (upload.file.type !== "image/png") {
      setError("Only PNG files are supported.");
      return;
    }

    const fileStem = normalizeFileStem(upload.fileStem);
    if (!fileStem) {
      setError("File stem must contain letters, numbers, underscores, or hyphens.");
      return;
    }

    const formData = new FormData();
    formData.set("type", uploadSelection.type);
    formData.set("biome", uploadSelection.biome);
    formData.set("vector", uploadSelection.vector);
    formData.set("fileStem", fileStem);
    formData.set("image", upload.file);

    setIsSaving(true);
    try {
      const response = await fetch(`${localDataServerUrl}/hex-background-sprites`, {
        method: "POST",
        body: formData,
      });
      const responseBody = await response.json().catch(() => undefined) as {error?: string; file?: string} | undefined;

      if (!response.ok) {
        throw new Error(responseBody?.error ?? `Upload failed with status ${response.status}.`);
      }

      setStatus(`Saved ${responseBody?.file ?? fileStem}. Refresh the page if it does not appear in the table.`);
      setUpload(current => ({
        ...current,
        fileStem: "",
        file: null,
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={s.page}>
      <aside className={s.panel}>
        <div className={s.header}>
          <h1 className={s.title}>Hex Backgrounds</h1>
          <p className={s.subtitle}>Upload base terrain and obstacle PNGs into the local asset folders.</p>
        </div>

        <form className={s.form} onSubmit={handleSubmit}>
          <label className={s.field}>
            <span className={s.label}>Asset type</span>
            <select
              className={s.input}
              value={uploadSelection.type}
              onChange={event => dispatch(setHexBackgroundUploadSelection({type: event.target.value as CityHexBackgroundType}))}
            >
              {terrainTypes.map(type => <option key={type} value={type}>{formatLabel(type)}</option>)}
            </select>
          </label>

          <label className={s.field}>
            <span className={s.label}>Biome</span>
            <select
              className={s.input}
              value={uploadSelection.biome}
              onChange={event => dispatch(setHexBackgroundUploadSelection({biome: event.target.value as CityBiome}))}
            >
              {biomes.map(biome => <option key={biome} value={biome}>{CITY_BIOME_LABELS[biome]}</option>)}
            </select>
          </label>

          <label className={s.field}>
            <span className={s.label}>Vector</span>
            <select
              className={s.input}
              value={uploadSelection.vector}
              onChange={event => dispatch(setHexBackgroundUploadSelection({vector: event.target.value as DevelopmentVectorKey}))}
            >
              {vectors.map(vector => <option key={vector} value={vector}>{formatLabel(vector)}</option>)}
            </select>
          </label>

          <label className={s.field}>
            <span className={s.label}>File stem</span>
            <input
              className={s.input}
              value={upload.fileStem}
              onChange={event => setUpload(current => ({...current, fileStem: event.target.value}))}
              placeholder="grass-01"
            />
          </label>

          <label className={s.field}>
            <span className={s.label}>PNG file</span>
            <input className={s.input} type="file" accept="image/png" onChange={handleFileChange} />
          </label>

          <button className={s.button} type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Upload"}
          </button>
          {status && <p className={s.status}>{status}</p>}
          {error && <p className={s.error}>{error}</p>}
        </form>
      </aside>

      <main className={s.panel}>
        <div className={s.header}>
          <h2 className={s.title}>Existing sprites</h2>
          <p className={s.subtitle}>Sprites loaded by the Vite asset catalog.</p>
        </div>

        <div className={s.filterGrid}>
          <label className={s.field}>
            <span className={s.label}>Search</span>
            <input
              className={s.input}
              value={filters.query}
              onChange={event => dispatch(setHexBackgroundEditorFilters({query: event.target.value}))}
              placeholder="id or file name"
            />
          </label>
          <FilterSelect label="Type" value={filters.type} options={terrainTypes} onChange={value => dispatch(setHexBackgroundEditorFilters({type: value as HexBackgroundEditorFilters["type"]}))} />
          <FilterSelect label="Biome" value={filters.biome} options={biomes} labels={CITY_BIOME_LABELS} onChange={value => dispatch(setHexBackgroundEditorFilters({biome: value as HexBackgroundEditorFilters["biome"]}))} />
          <FilterSelect label="Vector" value={filters.vector} options={vectors} onChange={value => dispatch(setHexBackgroundEditorFilters({vector: value as HexBackgroundEditorFilters["vector"]}))} />
        </div>

        <div className={s.summary}>{rows.length} of {CITY_HEX_BACKGROUND_SPRITES.length} sprites</div>

        <div className={s.tableWrap}>
          {rows.length ? (
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.headCell}>Preview</th>
                  <th className={s.headCell}>ID</th>
                  <th className={s.headCell}>Type</th>
                  <th className={s.headCell}>Biome</th>
                  <th className={s.headCell}>Vector</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(sprite => (
                  <tr key={sprite.id}>
                    <td className={s.cell}><img className={s.thumbnail} src={sprite.src} alt="" /></td>
                    <td className={`${s.cell} ${s.mono}`}>{sprite.id}</td>
                    <td className={s.cell}>{formatLabel(sprite.type)}</td>
                    <td className={s.cell}>{CITY_BIOME_LABELS[sprite.biome]}</td>
                    <td className={s.cell}>{formatLabel(sprite.vector)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={s.empty}>No matching sprites.</div>
          )}
        </div>
      </main>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  labels?: Partial<Record<string, string>>;
  onChange: (value: string) => void;
}) {
  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>
      <select className={s.input} value={value} onChange={event => onChange(event.target.value)}>
        <option value="">All</option>
        {options.map(option => (
          <option key={option} value={option}>{labels?.[option] ?? formatLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

function normalizeFileStem(value: string): string {
  return value
    .replace(/\.[^.]+$/u, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function formatLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
