import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef, ColumnFiltersState, PaginationState, VisibilityState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as s from './BuildPage.css.ts';
import { TOWER_PARTS, TOWER_PART_SLOT_ORDER } from '../../data/towers/index.ts';
import type { GunPart, TowerPartSlot } from '../../models/battle/towerParts.ts';
import { useTypedDispatch, useTypedSelector } from '../../store/hooks.ts';
import { selectActiveTower, selectActiveTowerDraftAssembly, selectAvailableTowerList, selectHasAnyTowerBuild } from '../../store/towers/selectors.ts';
import { cancelTowerDraft, clearTowerDraftPart, commitTowerDraft, selectTower, selectTowerDraftPart } from '../../store/towers/slice.ts';
import { selectCityResolution, selectCitySignatureStatus, selectResolvedEffectiveActiveTowerDraft } from '../../store/upkeep/selectors.ts';
import {selectUnlockedTowerPartIds, selectVisibleTowerPartIds} from "../../store/unlocks/selectors.ts";
import { UPKEEP_TYPES, UPKEEP_SPRITES, type UpkeepAmount, type UpkeepTypesValue } from '../../models/Upkeep.ts';
import { addUpkeep, deductUpkeep } from '../City/Components/CityHex/upkeepUtils.ts';
import { TowerAssemblyPreview } from './TowerAssemblyPreview.tsx';
import type { SupportStatusItem } from '../../models/build/buildPage.ts';
import {
  formatHomogeneousValue,
  getHomogeneousProductionContributions,
} from '../../models/homogeneousValueHelpers.ts';
import type {HomogeneousValueEffect} from '../../models/homogeneousValues.ts';
import {
  getUpkeepValues,
  normalizeMultiplier,
  resolveHomogeneousValueContributions,
} from '../../models/homogeneousValueResolution.ts';
import {homogeneousValueTotalsToUpkeepAmount} from '../../models/homogeneousValueAdapters.ts';
import {HOMOGENEOUS_VALUE_IDS, getHomogeneousValueDefinition} from '../../data/homogeneousValues/index.ts';

function getPartKeywords(part: GunPart) {
  return Array.from(part.keywords);
}

function formatModifierList(part: GunPart) {
  const effects = getHomogeneousProductionContributions(part).filter((effect) => (
    effect.valueId !== HOMOGENEOUS_VALUE_IDS.towerWeight
  ));
  if (!effects.length) return 'No stat modifiers';

  return effects
    .map((effect) => {
      const value = resolveEffectValue(effect);
      const definition = getHomogeneousValueDefinition(effect.valueId);
      return `${definition.label} ${value > 0 ? '+' : ''}${formatHomogeneousValue(effect.valueId, value, effect.additionalKeywords)}`;
    })
    .join(', ');
}

function getPartSupportCost(part: GunPart): UpkeepAmount {
  return homogeneousValueTotalsToUpkeepAmount(
    getUpkeepValues(resolveHomogeneousValueContributions(part.homogeneousValueEffects ?? [])),
  );
}

function getPartWeight(part: GunPart): number {
  return getHomogeneousProductionContributions(part)
    .filter((effect) => effect.valueId === HOMOGENEOUS_VALUE_IDS.towerWeight)
    .reduce((total, effect) => total + resolveEffectValue(effect), 0);
}

function resolveEffectValue(effect: HomogeneousValueEffect): number {
  return (effect.additive ?? 0) * normalizeMultiplier(effect.multiplier);
}

function getSupportStatus(required: UpkeepAmount, available: UpkeepAmount) {
  return (Object.values(UPKEEP_TYPES) as UpkeepTypesValue[])
    .flatMap((resource): SupportStatusItem[] => {
      const requiredAmount = required[resource] ?? 0;
      if (requiredAmount <= 0) return [];

      const availableAmount = available[resource] ?? 0;
      const missingAmount = Math.max(0, requiredAmount - availableAmount);

      return [{
        resource,
        label: UPKEEP_SPRITES[resource],
        requiredAmount,
        availableAmount,
        missingAmount,
      }];
    });
}

function hasEnoughUpkeep(required: UpkeepAmount, available: UpkeepAmount) {
  return getSupportStatus(required, available).every((item) => item.missingAmount === 0);
}

function getAvailableUpkeepForSlot(
  remainingUpkeep: UpkeepAmount,
  currentSlotPartCost: UpkeepAmount
) {
  return addUpkeep(remainingUpkeep, currentSlotPartCost);
}

const BuildPage = () => {
  const dispatch = useTypedDispatch();
  const activeTower = useTypedSelector(selectActiveTower);
  const towers = useTypedSelector(selectAvailableTowerList);
  const hasAnyTowerBuild = useTypedSelector(selectHasAnyTowerBuild);
  const towerDraftAssembly = useTypedSelector(selectActiveTowerDraftAssembly);
  const resolvedTower = useTypedSelector(selectResolvedEffectiveActiveTowerDraft);
  const visibleTowerPartIds = useTypedSelector(selectVisibleTowerPartIds);
  const unlockedTowerPartIds = useTypedSelector(selectUnlockedTowerPartIds);
  const cityResolution = useTypedSelector(selectCityResolution);
  const signatureStatus = useTypedSelector(selectCitySignatureStatus);
  const [activeTab, setActiveTab] = useState<TowerPartSlot>('platform');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 });
  const canModifyTower = !signatureStatus.isBesieged || !hasAnyTowerBuild;

  const selectSlot = (slot: TowerPartSlot) => {
    setActiveTab(slot);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const selectedPartId = towerDraftAssembly.selectedPartIds[activeTab];
  const visibleTowerPartIdSet = useMemo(() => new Set(visibleTowerPartIds), [visibleTowerPartIds]);
  const unlockedTowerPartIdSet = useMemo(() => new Set(unlockedTowerPartIds), [unlockedTowerPartIds]);
  const availableSlotOptions = useMemo(() => (
    TOWER_PART_SLOT_ORDER
      .map((slotOption) => ({
        ...slotOption,
        partsCount: TOWER_PARTS.filter((part) => (
          part.slot === slotOption.key && visibleTowerPartIdSet.has(part.id)
        )).length,
      }))
      .filter((slotOption) => slotOption.partsCount > 0)
  ), [visibleTowerPartIdSet]);
  const activeSlotParts = useMemo(
    () => TOWER_PARTS.filter((part) => (
      part.slot === activeTab && visibleTowerPartIdSet.has(part.id)
    )),
    [activeTab, visibleTowerPartIdSet]
  );

  useEffect(() => {
    if (availableSlotOptions.some((slotOption) => slotOption.key === activeTab)) return;

    const fallbackSlot = availableSlotOptions[0]?.key;
    if (!fallbackSlot) return;

    setActiveTab(fallbackSlot);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [activeTab, availableSlotOptions]);

  const columns: ColumnDef<GunPart, unknown>[] = useMemo(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => {
        const part = info.row.original;
        return (
          <div className={s.partNameCell}>
            <span>{part.name}</span>
          </div>
        );
      },
    },
    {
      id: 'vector',
      accessorKey: 'vector',
      header: 'Vector',
      cell: (info) => info.getValue() ?? 'medieval',
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => info.getValue() ?? '',
    },
    {
      id: 'keywords',
      accessorFn: (row) => getPartKeywords(row).join(', '),
      header: 'Keywords',
      cell: (info) => (
        <div className={s.keywords}>
          {getPartKeywords(info.row.original).map((keyword) => (
            <span key={keyword} className={s.keyword}>{keyword}</span>
          ))}
        </div>
      ),
    },
    {
      id: 'modifiers',
      accessorFn: formatModifierList,
      header: 'Modifiers',
      cell: (info) => info.getValue(),
    },
    {
      id: 'weight',
      accessorFn: getPartWeight,
      header: 'Weight',
      cell: (info) => info.getValue(),
    },
    {
      id: 'support',
      accessorFn: (row) => getSupportStatus(getPartSupportCost(row), {}).map((item) => item.label).join(', '),
      header: 'Support',
      cell: (info) => {
        const part = info.row.original;
        const currentSlotPart = resolvedTower.selectedParts[activeTab];
        const currentSlotPartCost = currentSlotPart ? getPartSupportCost(currentSlotPart) : {};
        const availableForThisSlot = getAvailableUpkeepForSlot(
          deductUpkeep(cityResolution.effectiveUpkeep, resolvedTower.supportCost),
          currentSlotPartCost
        );
        const supportStatus = getSupportStatus(getPartSupportCost(part), availableForThisSlot);

        if (supportStatus.length === 0) {
          return <span className={s.emptyText}>None</span>;
        }

        return (
          <div className={s.inlineList}>
            {supportStatus.map((item) => (
              <span
                key={item.resource}
                className={item.missingAmount > 0 ? s.missingCostPill : s.costPill}
              >
                {item.label} {item.requiredAmount}
                {item.missingAmount > 0 ? ` / missing ${item.missingAmount}` : ''}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'select',
      header: () => (
        <button
          className={s.clearHeaderButton}
          type="button"
          disabled={!selectedPartId || !canModifyTower}
          title={!canModifyTower ? 'The city is besieged. Tower rebuilding is blocked.' : undefined}
          onClick={() => dispatch(clearTowerDraftPart({ slot: activeTab }))}
        >
          clear
        </button>
      ),
      enableColumnFilter: false,
      cell: (info) => {
        const part = info.row.original;
        const selected = selectedPartId === part.id;
        const unlocked = unlockedTowerPartIdSet.has(part.id);
        const blockedTitle = !canModifyTower ? 'The city is besieged. Tower rebuilding is blocked.' : undefined;
        const lockedTitle = !unlocked ? 'This part is visible, but not permanently unlocked yet.' : undefined;

        return (
          <button
            className={selected ? s.removeButton : s.installButton}
            disabled={!canModifyTower || (!selected && !unlocked)}
            title={blockedTitle ?? lockedTitle ?? (selected ? 'Remove this part from the draft tower.' : undefined)}
            onClick={() => {
              if (!canModifyTower || (!selected && !unlocked)) return;
              if (selected) {
                dispatch(clearTowerDraftPart({ slot: activeTab }));
                return;
              }

              dispatch(selectTowerDraftPart({ slot: activeTab, partId: part.id }));
            }}
          >
            {selected ? 'Remove' : 'Install'}
          </button>
        );
      },
    },
  ], [activeTab, canModifyTower, cityResolution.effectiveUpkeep, dispatch, resolvedTower.selectedParts, resolvedTower.supportCost, selectedPartId, unlockedTowerPartIdSet]);

  const table = useReactTable({
    data: activeSlotParts,
    columns,
    state: { columnFilters, columnVisibility, pagination },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const supportCost = getSupportStatus(resolvedTower.supportCost, cityResolution.effectiveUpkeep);
  const hasCompleteDraft = resolvedTower.warnings.length === 0;
  const canRebuild = hasEnoughUpkeep(resolvedTower.supportCost, cityResolution.effectiveUpkeep)
    && hasCompleteDraft
    && canModifyTower;
  const draftChanged = JSON.stringify(activeTower?.selectedPartIds ?? {}) !== JSON.stringify(towerDraftAssembly.selectedPartIds);
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const firstVisibleRow = filteredRowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastVisibleRow = Math.min(filteredRowCount, (pagination.pageIndex + 1) * pagination.pageSize);
  const columnLabels: Record<string, string> = {
    name: 'Name',
    vector: 'Vector',
    description: 'Description',
    keywords: 'Keywords',
    modifiers: 'Modifiers',
    weight: 'Weight',
    support: 'Support',
    select: 'Install',
  };
  const statRows = [
    ['Damage', resolvedTower.stats.projectileDamage.toFixed(1)],
    ['Shots/s', resolvedTower.stats.shotsPerSecond.toFixed(2)],
    ['Range', `${resolvedTower.stats.targetingDistanceLimit.toFixed(0)} px`],
    ['Projectile speed', `${resolvedTower.stats.projectileSpeed.toFixed(0)} px/s`],
    ['Projectile radius', `${resolvedTower.stats.projectileRadius.toFixed(0)} px`],
    ['Spread', `${resolvedTower.stats.projectileSpread.toFixed(2)} rad`],
    ['Rotation', `${resolvedTower.stats.rotationSpeed.toFixed(2)} rad/s`],
    ['Weight', resolvedTower.stats.weight.toFixed(0)],
    ['Area', `${resolvedTower.stats.aoeRadius.toFixed(0)} px`],
    ['Retarget', `${resolvedTower.stats.retargetCooldownSeconds.toFixed(2)} s`],
    ['Trigger', formatHomogeneousValue(HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance, resolvedTower.stats.triggerTolerance)],
  ];

  return (
    <div className={s.buildPage}>
      <section className={s.assemblyPanel}>
        <div className={s.towerSelector} aria-label="Tower slots">
          {towers.map((tower) => {
            const selected = tower.id === activeTower?.id;
            const committedPartsCount = Object.keys(tower.selectedPartIds).length;
            const status = committedPartsCount > 0 ? `${committedPartsCount} parts` : 'Empty';

            return (
              <button
                key={tower.id}
                className={`${s.towerSelectorButton} ${selected ? s.towerSelectorButtonActive : ''}`}
                title={`${tower.name}: ${status}`}
                onClick={() => {
                  dispatch(selectTower({ towerId: tower.id }));
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
              >
                <span className={s.towerSelectorName}>{tower.name}</span>
              </button>
            );
          })}
        </div>

        <div className={s.assemblyGrid}>
          <div className={s.towerPreview}>
            <div className={s.towerImage}>
              <TowerAssemblyPreview resolvedTower={resolvedTower} />
            </div>
          </div>

          <aside className={s.towerStats}>
            <h2 className={s.panelTitle}>Resolved Build</h2>
            <div className={s.statsGrid}>
              {statRows.map(([label, value]) => (
                <div key={label} className={s.statItem}>
                  <span className={s.statLabel}>{label}</span>
                  <strong className={s.statValue}>{value}</strong>
                </div>
              ))}
            </div>

            <div className={s.summaryBlock}>
              <h3 className={s.summaryTitle}>Support</h3>
              <div className={s.inlineList}>
                {supportCost.length > 0
                  ? supportCost.map((item) => (
                    <span
                      key={item.resource}
                      className={item.missingAmount > 0 ? s.missingCostPill : s.costPill}
                    >
                      {item.label} {item.requiredAmount}
                      {item.missingAmount > 0 ? ` / missing ${item.missingAmount}` : ''}
                    </span>
                  ))
                  : <span className={s.emptyText}>No support required</span>}
              </div>
            </div>

            <div className={s.summaryBlock}>
              <h3 className={s.summaryTitle}>Active Synergies</h3>
              {resolvedTower.synergies.length > 0 ? (
                <div className={s.synergyList}>
                  {resolvedTower.synergies.map((synergy) => (
                    <div key={synergy.id} className={s.synergyItem}>
                      <strong>{synergy.name}</strong>
                      <span>{synergy.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className={s.emptyText}>No synergies active</span>
              )}
            </div>

            <div className={s.summaryBlock}>
              <h3 className={s.summaryTitle}>Warnings</h3>
              {resolvedTower.warnings.length > 0 ? (
                <div className={s.warningList}>
                  {resolvedTower.warnings.map((warning) => (
                    <span key={warning.id} className={s.warningItem}>{warning.message}</span>
                  ))}
                </div>
              ) : (
                <span className={s.emptyText}>Ready for field testing</span>
              )}
            </div>

            <div className={s.statsActions}>
              <button
                className={s.rebuildButton}
                disabled={!canRebuild}
                title={!canModifyTower
                  ? 'The city is besieged. Tower rebuilding is blocked.'
                  : !hasCompleteDraft ? 'Select all required tower components before rebuilding.'
                  : !canRebuild ? 'City support is too low for this draft tower' : undefined}
                onClick={() => {
                  if (!canRebuild) return;
                  dispatch(commitTowerDraft(undefined));
                }}
              >
                Rebuild
              </button>
              <button
                className={s.cancelButton}
                disabled={!draftChanged}
                onClick={() => dispatch(cancelTowerDraft(undefined))}
              >
                Cancel
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className={s.partsPanel}>
        <div className={s.slotStrip} aria-label="Tower part slots">
          {availableSlotOptions.map(({ key, label }) => {
            const part = resolvedTower.selectedParts[key];
            const active = activeTab === key;
            return (
              <button
                key={key}
                className={`${s.slotButton} ${active ? s.slotButtonActive : ''}`}
                title={`${label}: ${part?.name ?? 'Empty'}`}
                onClick={() => selectSlot(key)}
              >
                <span className={s.slotLabel}>{label}</span>
              </button>
            );
          })}
          <details className={s.columnDropdown}>
            <summary
              className={s.columnDropdownSummary}
              aria-label="Visible columns"
              title="Visible columns"
            >
              <span className={s.gearIcon} aria-hidden="true">⚙</span>
            </summary>
            <div className={s.columnDropdownMenu}>
              {table.getAllLeafColumns().map((column) => (
                <label key={column.id} className={s.columnToggle}>
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  {columnLabels[column.id] ?? column.id}
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className={s.tableContainer}>
          <table className={s.partsTable}>
            <thead className={s.tableHead}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={s.tableRow}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className={s.tableHeaderCell}>
                      {header.isPlaceholder ? null : (
                        <div className={s.headerContent}>
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          {header.column.getCanFilter() && header.column.id !== 'select' ? (
                            <input
                              className={s.filterInput}
                              value={(header.column.getFilterValue() as string) ?? ''}
                              onChange={(event) => header.column.setFilterValue(event.target.value)}
                              placeholder="Filter"
                            />
                          ) : null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const selected = selectedPartId === row.original.id;

                return (
                  <tr
                    key={row.id}
                    className={`${s.tableRow} ${selected ? s.selectedRow : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={s.tableCell}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {table.getRowModel().rows.length === 0 ? (
                <tr className={s.tableRow}>
                  <td className={s.tableCell} colSpan={table.getAllLeafColumns().length}>
                    No parts match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className={s.paginationBar}>
          <span className={s.paginationSummary}>
            {firstVisibleRow}-{lastVisibleRow} of {filteredRowCount}
          </span>
          <div className={s.paginationControls}>
            <button
              className={s.paginationButton}
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </button>
            <span className={s.paginationSummary}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <button
              className={s.paginationButton}
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuildPage;
