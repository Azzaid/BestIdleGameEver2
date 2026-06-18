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
import { selectActiveTower, selectActiveTowerDraftAssembly, selectAvailableTowerList, selectHasAnyTowerBuild, selectResolvedActiveTowerDraft } from '../../store/towers/selectors.ts';
import { cancelTowerDraft, clearTowerDraftPart, commitTowerDraft, selectTower, selectTowerDraftPart } from '../../store/towers/slice.ts';
import { selectPurchasedTechsIds } from '../../store/research/selectors.ts';
import { selectCityResolution, selectCityTraceStatus } from '../../store/upkeep/selectors.ts';
import { formatTowerSlot } from '../../models/battle/resolveTowerAssembly.ts';
import { UPKEEP_TYPES, UPKEEP_SPRITES, type UpkeepAmount, type UpkeepTypesValue } from '../../models/Upkeep.ts';
import { addUpkeep, deductUpkeep } from '../City/Components/CityHex/upkeepUtils.ts';
import { TowerAssemblyPreview } from './TowerAssemblyPreview.tsx';
import type { SupportStatusItem } from '../../models/build/buildPage.ts';

function getPartKeywords(part: GunPart) {
  return Array.from(part.keywords);
}

function isPartUnlocked(part: GunPart, purchasedTechIds: readonly string[]) {
  return (part.unlockRequirements ?? []).every((requirement) => purchasedTechIds.includes(requirement.researchId));
}

function formatModifierList(part: GunPart) {
  if (!part.modifiers) return 'No stat modifiers';

  return Object.entries(part.modifiers)
    .map(([key, value]) => `${key} ${Number(value) > 0 ? '+' : ''}${value}`)
    .join(', ');
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
  const resolvedTower = useTypedSelector(selectResolvedActiveTowerDraft);
  const purchasedTechIds = useTypedSelector(selectPurchasedTechsIds);
  const cityResolution = useTypedSelector(selectCityResolution);
  const traceStatus = useTypedSelector(selectCityTraceStatus);
  const [activeTab, setActiveTab] = useState<TowerPartSlot>('platform');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 });
  const canModifyTower = !traceStatus.isBesieged || !hasAnyTowerBuild;

  const selectSlot = (slot: TowerPartSlot) => {
    setActiveTab(slot);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const selectedPartId = towerDraftAssembly.selectedPartIds[activeTab];
  const availableSlotOptions = useMemo(() => (
    TOWER_PART_SLOT_ORDER
      .map((slotOption) => ({
        ...slotOption,
        partsCount: TOWER_PARTS.filter((part) => (
          part.slot === slotOption.key && isPartUnlocked(part, purchasedTechIds)
        )).length,
      }))
      .filter((slotOption) => slotOption.partsCount > 0)
  ), [purchasedTechIds]);
  const activeSlotParts = useMemo(
    () => TOWER_PARTS.filter((part) => (
      part.slot === activeTab && isPartUnlocked(part, purchasedTechIds)
    )),
    [activeTab, purchasedTechIds]
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
      accessorFn: (row) => row.weight ?? 0,
      header: 'Weight',
      cell: (info) => info.getValue(),
    },
    {
      id: 'support',
      accessorFn: (row) => getSupportStatus(row.supportCost ?? {}, {}).map((item) => item.label).join(', '),
      header: 'Support',
      cell: (info) => {
        const part = info.row.original;
        const currentSlotPartCost = resolvedTower.selectedParts[activeTab]?.supportCost ?? {};
        const availableForThisSlot = getAvailableUpkeepForSlot(
          deductUpkeep(cityResolution.effectiveUpkeep, resolvedTower.supportCost),
          currentSlotPartCost
        );
        const supportStatus = getSupportStatus(part.supportCost ?? {}, availableForThisSlot);

        if (supportStatus.length === 0) {
          return <span className={s.emptyText}>None</span>;
        }

        return (
          <div className={s.inlineList}>
            {supportStatus.map((item) => (
              <span
                key={item.resource.description}
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
      header: 'Install',
      enableColumnFilter: false,
      cell: (info) => {
        const part = info.row.original;
        const selected = selectedPartId === part.id;
        const blockedTitle = !canModifyTower ? 'The city is besieged. Tower rebuilding is blocked.' : undefined;

        return (
          <button
            className={selected ? s.removeButton : s.installButton}
            disabled={!canModifyTower}
            title={blockedTitle ?? (selected ? 'Remove this part from the draft tower.' : undefined)}
            onClick={() => {
              if (!canModifyTower) return;
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
  ], [activeTab, canModifyTower, cityResolution.effectiveUpkeep, dispatch, resolvedTower.selectedParts, resolvedTower.supportCost, selectedPartId]);

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
  const statRows = [
    ['Damage', resolvedTower.stats.projectileDamage.toFixed(1)],
    ['Reload', `${resolvedTower.stats.reloadSpeed.toFixed(2)} shots/s`],
    ['Range', `${resolvedTower.stats.targetingDistanceLimit.toFixed(0)} px`],
    ['Projectile speed', `${resolvedTower.stats.projectileSpeed.toFixed(0)} px/s`],
    ['Rotation', `${resolvedTower.stats.rotationSpeed.toFixed(2)} rad/s`],
    ['Weight', resolvedTower.stats.weight.toFixed(0)],
    ['Area', `${resolvedTower.stats.aoeRadius.toFixed(0)} px`],
    ['Retarget', `${resolvedTower.stats.retargetCooldownSeconds.toFixed(2)} s`],
  ];

  return (
    <div className={s.buildPage}>
      <header className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Assemble Your Tower</h1>
          <p className={s.pageSubtitle}>{activeTower?.name ?? 'Tower'} is assembled from machine parts, support systems, and targeting logic.</p>
        </div>
      </header>

      <section className={s.towerSelector} aria-label="Tower slots">
        {towers.map((tower) => {
          const selected = tower.id === activeTower?.id;
          const committedPartsCount = Object.keys(tower.selectedPartIds).length;

          return (
            <button
              key={tower.id}
              className={`${s.towerSelectorButton} ${selected ? s.towerSelectorButtonActive : ''}`}
              onClick={() => {
                dispatch(selectTower({ towerId: tower.id }));
                setPagination((current) => ({ ...current, pageIndex: 0 }));
              }}
            >
              <span className={s.towerSelectorName}>{tower.name}</span>
              <span className={s.towerSelectorStatus}>
                {committedPartsCount > 0 ? `${committedPartsCount} parts` : 'Empty'}
              </span>
            </button>
          );
        })}
      </section>

      <section className={s.assemblyGrid}>
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
                    key={item.resource.description}
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
      </section>

      <section className={s.slotStrip} aria-label="Tower part slots">
        {availableSlotOptions.map(({ key, label }) => {
          const part = resolvedTower.selectedParts[key];
          const active = activeTab === key;
          return (
            <button
              key={key}
              className={`${s.slotButton} ${active ? s.slotButtonActive : ''}`}
              onClick={() => selectSlot(key)}
            >
              <span className={s.slotLabel}>{label}</span>
              <span className={s.slotPartName}>{part?.name ?? 'Empty'}</span>
            </button>
          );
        })}
      </section>

      <section className={s.partsPanel}>
        <div className={s.partsHeader}>
          <div>
            <h2 className={s.panelTitle}>{formatTowerSlot(activeTab)} Parts</h2>
            <p className={s.panelSubtitle}>Pick one available part for this slot.</p>
          </div>
          <button
            className={s.cancelButton}
            type="button"
            disabled={!selectedPartId || !canModifyTower}
            title={!canModifyTower ? 'The city is besieged. Tower rebuilding is blocked.' : undefined}
            onClick={() => dispatch(clearTowerDraftPart({ slot: activeTab }))}
          >
            Clear Slot
          </button>
          <div className={s.columnChooser}>
            {table.getAllLeafColumns().map((column) => (
              <label key={column.id} className={s.columnToggle}>
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />
                {column.columnDef.header as string}
              </label>
            ))}
          </div>
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
