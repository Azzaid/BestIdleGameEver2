import {useEffect, useMemo, useState, type ReactElement} from "react";
import {Link} from "react-router-dom";
import {buildingIds, enemyIds, gunpartIds, superstructureIds, technologyIds, wallIds} from "../../data/ids.ts";
import * as s from "./ContentPlanPage.css.ts";

type ContentPlanNode = {
  id: string;
  header: string;
  description: string;
  entityId?: string;
  childIds: string[];
};

type ContentPlan = {
  version: 1;
  rootIds: string[];
  nodes: Record<string, ContentPlanNode>;
};

type SaveStatus = {
  kind: "idle" | "loading" | "saving" | "success" | "error";
  message: string;
};

const localDataServerUrl = "http://127.0.0.1:4317";
const contentPlanFile = "high-level-content-plan.json";
const defaultRootId = "content-plan-root";
const allEntityIds = [
  ...technologyIds,
  ...buildingIds,
  ...wallIds,
  ...superstructureIds,
  ...gunpartIds,
  ...enemyIds,
].sort((left, right) => left.localeCompare(right));

const emptyPlan: ContentPlan = {
  version: 1,
  rootIds: [defaultRootId],
  nodes: {
    [defaultRootId]: {
      id: defaultRootId,
      header: "Content Plan",
      description: "High level content plan for future game entities and progression beats.",
      childIds: [],
    },
  },
};

export default function ContentPlanPage() {
  const [plan, setPlan] = useState<ContentPlan>(emptyPlan);
  const [selectedNodeId, setSelectedNodeId] = useState(defaultRootId);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => new Set([defaultRootId]));
  const [draftHeader, setDraftHeader] = useState(emptyPlan.nodes[defaultRootId].header);
  const [draftDescription, setDraftDescription] = useState(emptyPlan.nodes[defaultRootId].description);
  const [draftEntityId, setDraftEntityId] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({kind: "loading", message: "Loading plan..."});

  const fallbackNodeId = plan.rootIds[0] ?? defaultRootId;
  const selectedNode = plan.nodes[selectedNodeId] ?? plan.nodes[fallbackNodeId] ?? emptyPlan.nodes[defaultRootId];
  const selectedChildren = selectedNode.childIds
    .map(childId => plan.nodes[childId])
    .filter(isContentPlanNode);
  const entityEditorUrl = `/dev/entity-create/new?name=${encodeURIComponent(draftHeader)}&description=${encodeURIComponent(draftDescription)}`;

  const renderedTree = useMemo(() => (
    plan.rootIds.flatMap(rootId => renderNode(rootId, 0))
  ), [expandedNodeIds, plan, selectedNodeId]);

  useEffect(() => {
    let isMounted = true;

    async function loadPlan() {
      try {
        const response = await fetch(`${localDataServerUrl}/game-files/${contentPlanFile}`);
        if (!response.ok) {
          throw new Error(`Local data server returned ${response.status}.`);
        }
        const loadedPlan = normalizePlan(await response.json());
        if (!isMounted) return;
        setPlan(loadedPlan);
        const firstNodeId = loadedPlan.rootIds[0] ?? defaultRootId;
        setSelectedNodeId(firstNodeId);
        setExpandedNodeIds(new Set([firstNodeId]));
        setSaveStatus({kind: "idle", message: ""});
      } catch (error) {
        if (!isMounted) return;
        setPlan(emptyPlan);
        setSelectedNodeId(defaultRootId);
        setExpandedNodeIds(new Set([defaultRootId]));
        setSaveStatus({
          kind: "error",
          message: error instanceof Error
            ? `Could not load local JSON: ${error.message}`
            : "Could not load local JSON.",
        });
      }
    }

    void loadPlan();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedNode) return;
    setDraftHeader(selectedNode.header);
    setDraftDescription(selectedNode.description);
    setDraftEntityId(selectedNode.entityId ?? "");
  }, [selectedNode]);

  return (
    <section className={s.page}>
      <aside className={s.treePane}>
        <header className={s.paneHeader}>
          <h1 className={s.title}>Content Plan</h1>
          <button className={s.iconButton} type="button" onClick={() => addNode(null)} title="Add root entry">+</button>
        </header>
        <div className={s.treeList}>
          {renderedTree}
        </div>
      </aside>

      <main className={s.editorPane}>
        <section className={s.section}>
          <div className={s.grid}>
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Header</span>
              <input className={s.input} value={draftHeader} onChange={event => setDraftHeader(event.target.value)} />
            </label>
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Description</span>
              <textarea className={s.textarea} value={draftDescription} onChange={event => setDraftDescription(event.target.value)} />
            </label>
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Existing entity ID</span>
              <select className={s.input} value={draftEntityId} onChange={event => setDraftEntityId(event.target.value)}>
                <option value="">No linked entity</option>
                {allEntityIds.map(entityId => (
                  <option key={entityId} value={entityId}>{entityId}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={s.actionRow}>
            <button className={s.primaryButton} type="button" disabled={saveStatus.kind === "saving"} onClick={saveSelectedNode}>
              {saveStatus.kind === "saving" ? "Saving..." : "Save"}
            </button>
            <Link className={s.button} to={entityEditorUrl}>Edit entity draft</Link>
            {saveStatus.message && (
              <span className={saveStatus.kind === "error" ? s.errorText : s.statusText}>{saveStatus.message}</span>
            )}
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.title}>Immediate Children</h2>
          <div className={s.childList}>
            {selectedChildren.length === 0 && <span className={s.muted}>No child nodes yet.</span>}
            {selectedChildren.map(child => (
              <button key={child.id} className={s.childItem} type="button" onClick={() => selectNode(child.id)}>
                <span className={s.nodeHeader}>{child.header}</span>
                <span className={s.nodeDescription}>{child.description || "No description."}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </section>
  );

  function renderNode(nodeId: string, depth: number): ReactElement[] {
    const node = plan.nodes[nodeId];
    if (!node) return [];

    const isExpanded = expandedNodeIds.has(node.id);
    const hasChildren = node.childIds.length > 0;
    const row = (
      <div key={node.id} className={node.id === selectedNodeId ? s.selectedTreeRow : s.treeRow} style={{paddingLeft: `${depth * 14 + 4}px`}}>
        <button
          className={s.iconButton}
          type="button"
          disabled={!hasChildren}
          onClick={() => toggleExpanded(node.id)}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {hasChildren ? (isExpanded ? "-" : "+") : ""}
        </button>
        <button className={s.rowButton} type="button" onClick={() => selectNode(node.id)}>
          <span className={s.nodeHeader}>{node.header}</span>
          <span className={s.nodeDescription}>{getChildSummary(node)}</span>
        </button>
        <span className={s.tick} title={node.entityId ? `Linked to ${node.entityId}` : ""}>{node.entityId ? "\u2713" : ""}</span>
        <button className={s.iconButton} type="button" onClick={() => addNode(node.id)} title="Add child entry">+</button>
      </div>
    );

    if (!isExpanded) return [row];

    return [
      row,
      ...node.childIds.flatMap(childId => renderNode(childId, depth + 1)),
    ];
  }

  function selectNode(nodeId: string) {
    setSelectedNodeId(nodeId);
  }

  function toggleExpanded(nodeId: string) {
    setExpandedNodeIds(current => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  function addNode(parentId: string | null) {
    const nodeId = createNodeId();
    const node: ContentPlanNode = {
      id: nodeId,
      header: "New plan entry",
      description: "",
      childIds: [],
    };

    setPlan(current => {
      const nodes = {
        ...current.nodes,
        [nodeId]: node,
      };

      if (!parentId) {
        return {
          ...current,
          rootIds: [...current.rootIds, nodeId],
          nodes,
        };
      }

      const parentNode = current.nodes[parentId] ?? {
        id: parentId,
        header: "Untitled entry",
        description: "",
        childIds: [],
      };

      return {
        ...current,
        nodes: {
          ...nodes,
          [parentId]: {
            ...parentNode,
            childIds: [...parentNode.childIds, nodeId],
          },
        },
      };
    });
    setSelectedNodeId(nodeId);
    if (parentId) {
      setExpandedNodeIds(current => new Set([...current, parentId]));
    }
    setSaveStatus({kind: "idle", message: "New node added. Save to write JSON."});
  }

  async function saveSelectedNode() {
    const nextPlan = {
      ...plan,
      nodes: {
        ...plan.nodes,
        [selectedNode.id]: {
          ...selectedNode,
          header: draftHeader.trim() || "Untitled entry",
          description: draftDescription.trim(),
          entityId: draftEntityId || undefined,
        },
      },
    };

    setPlan(nextPlan);
    setSaveStatus({kind: "saving", message: "Saving plan JSON..."});

    try {
      const response = await fetch(`${localDataServerUrl}/game-files/${contentPlanFile}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextPlan),
      });
      const responseBody = await response.json().catch(() => null) as {error?: string} | null;

      if (!response.ok) {
        setSaveStatus({
          kind: "error",
          message: responseBody?.error ?? `Save failed with status ${response.status}.`,
        });
        return;
      }

      setSaveStatus({kind: "success", message: "Plan saved to local JSON."});
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not reach local data server.",
      });
    }
  }
}

function normalizePlan(source: unknown): ContentPlan {
  if (!source || Array.isArray(source) || typeof source !== "object") return emptyPlan;

  const candidate = source as Partial<ContentPlan>;
  if (!candidate.nodes || Array.isArray(candidate.nodes) || typeof candidate.nodes !== "object") return emptyPlan;
  const candidateNodes = candidate.nodes;

  const nodes = Object.fromEntries(
    Object.entries(candidateNodes).flatMap(([id, node]) => {
      if (!node || Array.isArray(node) || typeof node !== "object") return [];
      const typedNode = node as Partial<ContentPlanNode>;
      return [[
        id,
        {
          id,
          header: typedNode.header || "Untitled entry",
          description: typedNode.description || "",
          entityId: typedNode.entityId || undefined,
          childIds: Array.isArray(typedNode.childIds) ? typedNode.childIds.filter(isKnownChildId(candidateNodes)) : [],
        },
      ]];
    }),
  );
  const rootIds = Array.isArray(candidate.rootIds)
    ? candidate.rootIds.filter(rootId => typeof rootId === "string" && Boolean(nodes[rootId]))
    : [];

  if (rootIds.length === 0 || Object.keys(nodes).length === 0) return emptyPlan;

  return {
    version: 1,
    rootIds,
    nodes,
  };
}

function isKnownChildId(nodes: Partial<ContentPlan["nodes"]>) {
  return (childId: unknown): childId is string => typeof childId === "string" && Boolean(nodes[childId]);
}

function isContentPlanNode(node: ContentPlanNode | undefined): node is ContentPlanNode {
  return Boolean(node);
}

function getChildSummary(node: ContentPlanNode) {
  if (node.childIds.length === 0) return node.description || "No child nodes";
  return `${node.description ? `${node.description} / ` : ""}${node.childIds.length} child node${node.childIds.length === 1 ? "" : "s"}`;
}

function createNodeId() {
  if (globalThis.crypto?.randomUUID) {
    return `plan-${globalThis.crypto.randomUUID()}`;
  }

  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
