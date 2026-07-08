import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { ColumnDef, PaginationState, VisibilityState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as s from './BuildPage.css.ts';
import { TOWER_PARTS, TOWER_PART_SLOT_ORDER } from '../../data/gunParts/index.ts';
import { TOWER_PART_VISUAL_ASSETS } from '../../data/gunParts/partVisualMetadata.ts';
import type { GunPart, TowerPartSlot } from '../../models/battle/towerParts.ts';
import { useTypedDispatch, useTypedSelector } from '../../store/hooks.ts';
import { selectActiveTower, selectActiveTowerDraftAssembly, selectAvailableTowerList, selectHasAnyTowerBuild } from '../../store/towers/selectors.ts';
import { cancelTowerDraft, clearTowerDraftPart, commitTowerDraft, selectTower, selectTowerDraftPart } from '../../store/towers/slice.ts';
import { selectCityResolution, selectCitySignatureStatus, selectResolvedEffectiveActiveTowerDraft } from '../../store/upkeep/selectors.ts';
import {selectRequirementResolutionData, selectUnlockedTowerPartIds, selectVisibleTowerPartIds} from "../../store/unlocks/selectors.ts";
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
import {getHomogeneousValueIdForUpkeepType, homogeneousValueTotalsToUpkeepAmount} from '../../models/homogeneousValueAdapters.ts';
import {HOMOGENEOUS_VALUE_IDS, getHomogeneousValueDefinition} from '../../data/homogeneousValues/index.ts';
import {areRequirementsMet, getUnmetRequirements, type Requirement} from '../../models/progression/requirements.ts';
import {DEVELOPMENT_VECTOR_LABELS, type DevelopmentVectorKey} from '../../models/DevlopmentVector.ts';

type ModifierRow = {
  key: string;
  label: string;
  value: number;
  valueId: string;
  additionalKeywords?: readonly string[];
};

const vectorRowColors: Record<DevelopmentVectorKey, string> = {
  neutral: 'rgba(150, 150, 150, 0.18)',
  tech: 'rgba(84, 185, 255, 0.2)',
  nature: 'rgba(94, 190, 103, 0.2)',
  medieval: 'rgba(210, 160, 82, 0.2)',
  aether: 'rgba(172, 112, 255, 0.22)',
};

function getPartKeywords(part: GunPart) {
  return Array.from(part.keywords);
}

function getPartModifierRows(part: GunPart): ModifierRow[] {
  const effects = getHomogeneousProductionContributions({
    values: part.values,
  }).filter((effect) => (
    effect.valueId !== HOMOGENEOUS_VALUE_IDS.towerWeight
  ));

  return effects
    .map((effect): ModifierRow => {
      const value = resolveEffectValue(effect);
      const definition = getHomogeneousValueDefinition(effect.valueId);
      const additionalKeywords = effect.additionalKeywords ?? [];

      return {
        key: `${effect.valueId}:${additionalKeywords.join('.')}`,
        label: definition.label,
        value,
        valueId: effect.valueId,
        additionalKeywords,
      };
    });
}

function getModifierDeltaRows(part: GunPart, installedPart?: GunPart): ModifierRow[] {
  const candidateRows = getPartModifierRows(part);
  const installedRows = installedPart ? getPartModifierRows(installedPart) : [];
  const keys = [...new Set([
    ...candidateRows.map((row) => row.key),
    ...installedRows.map((row) => row.key),
  ])];

  return keys.map((key) => {
    const candidate = candidateRows.find((row) => row.key === key);
    const installed = installedRows.find((row) => row.key === key);
    const base = candidate ?? installed!;

    return {
      ...base,
      value: (candidate?.value ?? 0) - (installed?.value ?? 0),
    };
  }).filter((row) => Math.abs(row.value) > 0.0001);
}

function formatModifierValue(row: ModifierRow, forceSign = false) {
  const prefix = forceSign && row.value > 0 ? '+' : '';
  return `${prefix}${formatHomogeneousValue(row.valueId, row.value, row.additionalKeywords)}`;
}

function getVectorRowStyle(vector: DevelopmentVectorKey | undefined): CSSProperties {
  const color = vectorRowColors[vector ?? 'medieval'];

  return {
    background: `linear-gradient(90deg, ${color}, rgba(255, 255, 255, 0) 34%)`,
  };
}

function getPartSupportCost(part: GunPart): UpkeepAmount {
  return homogeneousValueTotalsToUpkeepAmount(
    getUpkeepValues(resolveHomogeneousValueContributions(part.values ?? [])),
  );
}

function getPartWeight(part: GunPart): number {
  return getHomogeneousProductionContributions({
    values: part.values,
  })
    .filter((effect) => effect.valueId === HOMOGENEOUS_VALUE_IDS.towerWeight)
    .reduce((total, effect) => total + resolveEffectValue(effect), 0);
}

function resolveEffectValue(effect: HomogeneousValueEffect): number {
  return (effect.additive ?? 0) * normalizeMultiplier(effect.multiplier);
}

function formatOptionalLimit(value: number, valueId: string, zeroIsUnlimited = false): string {
  return Number.isFinite(value) && (!zeroIsUnlimited || value > 0)
    ? formatHomogeneousValue(valueId, value)
    : 'Unlimited';
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
        formattedRequiredAmount: formatUpkeepResourceAmount(resource, requiredAmount),
        formattedAvailableAmount: formatUpkeepResourceAmount(resource, availableAmount),
        formattedMissingAmount: formatUpkeepResourceAmount(resource, missingAmount),
      }];
    });
}

function hasEnoughUpkeep(required: UpkeepAmount, available: UpkeepAmount) {
  return getSupportStatus(required, available).every((item) => item.missingAmount === 0);
}

function formatUnmetBuildRequirements(
  requirements: readonly Requirement[],
  requirementResolutionData: ReturnType<typeof selectRequirementResolutionData>,
): string {
  return requirements.map(requirement => formatUnmetBuildRequirement(requirement, requirementResolutionData)).join('; ');
}

function formatUnmetBuildRequirement(
  requirement: Requirement,
  requirementResolutionData: ReturnType<typeof selectRequirementResolutionData>,
): string {
  if (requirement.type === 'technologyUnlocked') {
    return `Requires technology ${requirement.technologyId}`;
  }

  if (requirement.type === 'buildingExists') {
    return `Requires building ${requirement.buildingId}`;
  }

  if (requirement.type === 'buildingKeywordExists') {
    return `Requires ${requirement.keyword} building`;
  }

  if (requirement.type === 'globalFlagExists') {
    return `Requires flag ${requirement.flagId}`;
  }

  if (requirement.type === 'globalFlagMissing') {
    return `Requires missing flag ${requirement.flagId}`;
  }

  const definition = getHomogeneousValueDefinition(requirement.valueId);
  const currentValue = requirementResolutionData.resolvedCityData.homogeneousValues[requirement.valueId] ?? 0;
  const amount = formatHomogeneousValue(requirement.valueId, requirement.amount);
  const current = formatHomogeneousValue(requirement.valueId, currentValue);

  if (requirement.type === 'homogeneousValueAtLeast') {
    return `Requires ${definition.label} at least ${amount} (current ${current})`;
  }

  return `Requires ${definition.label} below ${amount} (current ${current})`;
}

function formatResourceAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function formatUpkeepResourceAmount(resource: UpkeepTypesValue, amount: number): string {
  return formatHomogeneousValue(getHomogeneousValueIdForUpkeepType(resource), amount);
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
  const requirementResolutionData = useTypedSelector(selectRequirementResolutionData);
  const signatureStatus = useTypedSelector(selectCitySignatureStatus);
  const [activeTab, setActiveTab] = useState<TowerPartSlot>(TOWER_PART_SLOT_ORDER[0].key);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 });
  const [detailsPart, setDetailsPart] = useState<GunPart | null>(null);
  const isNarrowScreen = useMediaQuery('(max-width: 700px)');
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
  const installedSlotPart = useMemo(() => {
    const installedPartId = activeTower?.selectedPartIds[activeTab];
    return installedPartId ? TOWER_PARTS.find((part) => part.id === installedPartId) : undefined;
  }, [activeTab, activeTower?.selectedPartIds]);

  useEffect(() => {
    if (availableSlotOptions.some((slotOption) => slotOption.key === activeTab)) return;

    const fallbackSlot = availableSlotOptions[0]?.key;
    if (!fallbackSlot) return;

    setActiveTab(fallbackSlot);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [activeTab, availableSlotOptions]);

  useEffect(() => {
    setDetailsPart(null);
  }, [activeTab]);

  const selectColumn: ColumnDef<GunPart, unknown> = useMemo(() => ({
    id: 'select',
    header: () => isNarrowScreen ? null : (
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
      const buildRequirementsMet = areRequirementsMet(part.buildRequirements, requirementResolutionData);
      const blockedTitle = !canModifyTower ? 'The city is besieged. Tower rebuilding is blocked.' : undefined;
      const lockedTitle = !unlocked ? 'This part is visible, but not permanently unlocked yet.' : undefined;
      const buildRequirementsTitle = !buildRequirementsMet
        ? formatUnmetBuildRequirements(getUnmetRequirements(part.buildRequirements, requirementResolutionData), requirementResolutionData)
        : undefined;

      return (
        <button
          className={`${selected ? s.removeButton : s.installButton} ${isNarrowScreen ? s.compactActionButton : ''}`}
          disabled={!canModifyTower || (!selected && (!unlocked || !buildRequirementsMet))}
          title={blockedTitle ?? lockedTitle ?? buildRequirementsTitle ?? (selected ? 'Remove this part from the draft tower.' : 'Install this part.')}
          onClick={(event) => {
            event.stopPropagation();
            if (!canModifyTower || (!selected && (!unlocked || !buildRequirementsMet))) return;
            if (selected) {
              dispatch(clearTowerDraftPart({ slot: activeTab }));
              return;
            }

            dispatch(selectTowerDraftPart({ slot: activeTab, partId: part.id }));
          }}
        >
          {isNarrowScreen ? (selected ? '-' : '+') : selected ? 'Remove' : 'Install'}
        </button>
      );
    },
  }), [activeTab, canModifyTower, dispatch, isNarrowScreen, requirementResolutionData, selectedPartId, unlockedTowerPartIdSet]);

  const dataColumns: ColumnDef<GunPart, unknown>[] = useMemo(() => [
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
    ...(isNarrowScreen ? [] : [{
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => info.getValue() ?? '',
    } satisfies ColumnDef<GunPart, unknown>]),
    ...(isNarrowScreen ? [] : [{
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
    } satisfies ColumnDef<GunPart, unknown>]),
    {
      id: 'modifiers',
      accessorFn: (row) => getModifierDeltaRows(row, installedSlotPart)
        .map((modifier) => `${modifier.label} ${formatModifierValue(modifier, true)}`)
        .join(', '),
      header: 'Modifiers',
      cell: (info) => {
        const modifiers = getModifierDeltaRows(info.row.original, installedSlotPart);

        if (!modifiers.length) {
          return <span className={s.emptyText}>No change</span>;
        }

        return (
          <div className={s.modifierRows}>
            {modifiers.map((modifier) => (
              <span key={modifier.key} className={s.modifierRow}>
                <span>{modifier.label}</span>
                <strong>{formatModifierValue(modifier, true)}</strong>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'weight',
      accessorFn: getPartWeight,
      header: 'Weight',
      cell: (info) => <span className={s.weightValue}>{String(info.getValue())}</span>,
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
                {item.label} {item.formattedRequiredAmount}
                {item.missingAmount > 0 ? ` / missing ${item.formattedMissingAmount}` : ''}
              </span>
            ))}
          </div>
        );
      },
    },
  ], [activeTab, cityResolution.effectiveUpkeep, installedSlotPart, isNarrowScreen, requirementResolutionData, resolvedTower.selectedParts, resolvedTower.supportCost]);

  const columns: ColumnDef<GunPart, unknown>[] = useMemo(
    () => isNarrowScreen ? [selectColumn, ...dataColumns] : [...dataColumns, selectColumn],
    [dataColumns, isNarrowScreen, selectColumn]
  );

  const table = useReactTable({
    data: activeSlotParts,
    columns,
    state: { columnVisibility, pagination },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const supportCost = getSupportStatus(resolvedTower.supportCost, cityResolution.effectiveUpkeep);
  const hasCompleteDraft = resolvedTower.warnings.length === 0;
  const selectedPartBuildRequirementFailures = Object.values(resolvedTower.selectedParts)
    .flatMap((part) => part ? getUnmetRequirements(part.buildRequirements, requirementResolutionData) : []);
  const selectedPartBuildRequirementsMet = selectedPartBuildRequirementFailures.length === 0;
  const canRebuild = hasEnoughUpkeep(resolvedTower.supportCost, cityResolution.effectiveUpkeep)
    && selectedPartBuildRequirementsMet
    && hasCompleteDraft
    && canModifyTower;
  const actionLabel = hasAnyTowerBuild ? 'Rebuild' : 'Build';
  const draftChanged = JSON.stringify(activeTower?.selectedPartIds ?? {}) !== JSON.stringify(towerDraftAssembly.selectedPartIds);
  const filteredRowCount = table.getCoreRowModel().rows.length;
  const firstVisibleRow = filteredRowCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastVisibleRow = Math.min(filteredRowCount, (pagination.pageIndex + 1) * pagination.pageSize);
  const columnLabels: Record<string, string> = {
    name: 'Name',
    description: 'Description',
    keywords: 'Keywords',
    modifiers: 'Modifiers',
    weight: 'Weight',
    support: 'Support',
    select: 'Install',
  };
  const detailsModifierRows = detailsPart ? getPartModifierRows(detailsPart) : [];
  const detailsSupportCost = detailsPart ? getSupportStatus(getPartSupportCost(detailsPart), {}) : [];
  const detailsPreviewAsset = detailsPart ? TOWER_PART_VISUAL_ASSETS[detailsPart.sprite.textureKey] ?? TOWER_PART_VISUAL_ASSETS[detailsPart.id] : undefined;
  const statRows = [
    ['Damage', resolvedTower.stats.projectileDamage.toFixed(1)],
    ['Shots/s', resolvedTower.stats.shotsPerSecond.toFixed(2)],
    ['Burst', resolvedTower.stats.burstCount.toFixed(0)],
    ['Range', `${resolvedTower.stats.targetingDistanceLimit.toFixed(0)} px`],
    ['Max range', formatOptionalLimit(resolvedTower.stats.maximumRange, HOMOGENEOUS_VALUE_IDS.towerMaximumRange)],
    ['Min range', formatOptionalLimit(resolvedTower.stats.minimumRange, HOMOGENEOUS_VALUE_IDS.towerMinimumRange, true)],
    ['Projectile speed', `${resolvedTower.stats.projectileSpeed.toFixed(0)} px/s`],
    ['Projectile radius', `${resolvedTower.stats.projectileRadius.toFixed(0)} px`],
    ['Spread', `${resolvedTower.stats.projectileSpread.toFixed(2)} rad`],
    ['Rotation', `${resolvedTower.stats.rotationSpeed.toFixed(2)} rad/s`],
    ['Rotation limit', formatOptionalLimit(resolvedTower.stats.maximumRotationAngle, HOMOGENEOUS_VALUE_IDS.towerMaximumRotationAngle)],
    ['Weight', resolvedTower.stats.weight.toFixed(0)],
    ['Area', `${resolvedTower.stats.aoeRadius.toFixed(0)} px`],
    ['Retarget', `${resolvedTower.stats.retargetCooldownSeconds.toFixed(2)} s`],
    ['Trigger', formatHomogeneousValue(HOMOGENEOUS_VALUE_IDS.towerTriggerTolerance, resolvedTower.stats.triggerTolerance)],
    ['Zone push', `${resolvedTower.stats.zonePushBackDistance.toFixed(0)} px @ ${resolvedTower.stats.zonePushBacksPerSecond.toFixed(2)}/s`],
    ['Zone push size', `${resolvedTower.stats.zonePushBackZoneSize.toFixed(0)} px`],
    ['Zone flee', `${resolvedTower.stats.zoneFleeDuration.toFixed(2)} s @ ${resolvedTower.stats.zoneFleesPerSecond.toFixed(2)}/s`],
    ['Zone flee size', `${resolvedTower.stats.zoneFleeZoneSize.toFixed(0)} px`],
    ['Zone circle', `${resolvedTower.stats.zoneCircleDuration.toFixed(2)} s @ ${resolvedTower.stats.zoneCirclesPerSecond.toFixed(2)}/s`],
    ['Zone circle size', `${resolvedTower.stats.zoneCircleZoneSize.toFixed(0)} px`],
    ['Zone DoT', `${resolvedTower.stats.zoneDotDamage.toFixed(1)} @ ${resolvedTower.stats.zoneDotTicksPerSecond.toFixed(2)}/s`],
    ['Zone DoT size', `${resolvedTower.stats.zoneDotZoneSize.toFixed(0)} px`],
    ['Zone stun', `${resolvedTower.stats.zoneStunDuration.toFixed(2)} s @ ${resolvedTower.stats.zoneStunsPerSecond.toFixed(2)}/s`],
    ['Zone stun size', `${resolvedTower.stats.zoneStunZoneSize.toFixed(0)} px`],
    ['Target push', `${resolvedTower.stats.singleTargetPushBackDistance.toFixed(0)} px @ ${resolvedTower.stats.singleTargetPushBacksPerSecond.toFixed(2)}/s`],
    ['Target push range', `${resolvedTower.stats.singleTargetPushBackRange.toFixed(0)} px`],
    ['Target flee', `${resolvedTower.stats.singleTargetFleeDuration.toFixed(2)} s @ ${resolvedTower.stats.singleTargetFleesPerSecond.toFixed(2)}/s`],
    ['Target flee range', `${resolvedTower.stats.singleTargetFleeRange.toFixed(0)} px`],
    ['Target circle', `${resolvedTower.stats.singleTargetCircleDuration.toFixed(2)} s @ ${resolvedTower.stats.singleTargetCirclesPerSecond.toFixed(2)}/s`],
    ['Target circle range', `${resolvedTower.stats.singleTargetCircleRange.toFixed(0)} px`],
    ['Target DoT', `${resolvedTower.stats.singleTargetDotDamage.toFixed(1)} @ ${resolvedTower.stats.singleTargetDotTicksPerSecond.toFixed(2)}/s`],
    ['Target DoT range', `${resolvedTower.stats.singleTargetDotRange.toFixed(0)} px`],
    ['Target stun', `${resolvedTower.stats.singleTargetStunDuration.toFixed(2)} s @ ${resolvedTower.stats.singleTargetStunsPerSecond.toFixed(2)}/s`],
    ['Target stun range', `${resolvedTower.stats.singleTargetStunRange.toFixed(0)} px`],
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
                      {item.label} {item.formattedRequiredAmount}
                      {item.missingAmount > 0 ? ` / missing ${item.formattedMissingAmount}` : ''}
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

            <div className={`${s.statsActions} ${hasAnyTowerBuild ? '' : s.statsActionsCentered}`}>
              <button
                className={`${s.rebuildButton} ${hasAnyTowerBuild ? '' : s.buildButtonCentered}`}
                disabled={!canRebuild}
                title={!canModifyTower
                  ? 'The city is besieged. Tower rebuilding is blocked.'
                  : !hasCompleteDraft ? `Select all required tower components before ${actionLabel.toLowerCase()}ing.`
                  : !selectedPartBuildRequirementsMet ? formatUnmetBuildRequirements(selectedPartBuildRequirementFailures, requirementResolutionData)
                  : !canRebuild ? 'City support is too low for this draft tower' : undefined}
                onClick={() => {
                  if (!canRebuild) return;
                  dispatch(commitTowerDraft(undefined));
                }}
              >
                {actionLabel}
              </button>
              {hasAnyTowerBuild && (
                <button
                  className={s.cancelButton}
                  disabled={!draftChanged}
                  onClick={() => dispatch(cancelTowerDraft(undefined))}
                >
                  Cancel
                </button>
              )}
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
                    <th
                      key={header.id}
                      className={`${s.tableHeaderCell} ${header.column.id === 'weight' ? s.weightHeaderCell : ''}`}
                    >
                      {header.isPlaceholder ? null : (
                        <div className={s.headerContent}>
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
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
                    style={getVectorRowStyle(row.original.vector)}
                    onClick={() => setDetailsPart(row.original)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setDetailsPart(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`${s.tableCell} ${cell.column.id === 'weight' ? s.weightCell : ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {table.getRowModel().rows.length === 0 ? (
                <tr className={s.tableRow}>
                  <td className={s.tableCell} colSpan={table.getAllLeafColumns().length}>
                    No parts available for this slot.
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

      <div className={`${s.partDetailsShade} ${detailsPart ? s.partDetailsShadeOpen : ''}`} onClick={() => setDetailsPart(null)} />
      <aside className={`${s.partDetailsSheet} ${detailsPart ? s.partDetailsSheetOpen : ''}`} aria-hidden={!detailsPart}>
        {detailsPart ? (
          <>
            <div className={s.partDetailsHeader}>
              <div className={s.partPreviewFrame}>
                {detailsPreviewAsset ? (
                  <img className={s.partPreviewImage} src={detailsPreviewAsset.src} alt="" />
                ) : (
                  <span className={s.emptyText}>No preview</span>
                )}
              </div>
              <div className={s.partDetailsIntro}>
                <span className={s.partVectorLabel}>{DEVELOPMENT_VECTOR_LABELS[detailsPart.vector ?? 'medieval']}</span>
                <h2 className={s.partDetailsTitle}>{detailsPart.name}</h2>
                <p className={s.partDetailsDescription}>{detailsPart.description || 'No description available.'}</p>
              </div>
              <button className={s.partDetailsCloseButton} type="button" aria-label="Close part details" onClick={() => setDetailsPart(null)}>x</button>
            </div>

            <div className={s.partDetailsSection}>
              <h3 className={s.summaryTitle}>Keywords</h3>
              <div className={s.keywords}>
                {getPartKeywords(detailsPart).map((keyword) => (
                  <span key={keyword} className={s.keyword}>{keyword}</span>
                ))}
              </div>
            </div>

            <div className={s.partDetailsSection}>
              <h3 className={s.summaryTitle}>Values</h3>
              <div className={s.valueList}>
                {detailsModifierRows.length > 0 ? detailsModifierRows.map((modifier) => (
                  <span key={modifier.key} className={s.valueRow}>
                    <span>{modifier.label}</span>
                    <strong>{formatModifierValue(modifier, true)}</strong>
                  </span>
                )) : <span className={s.emptyText}>No stat modifiers</span>}
                <span className={s.valueRow}>
                  <span>Weight</span>
                  <strong>{formatResourceAmount(getPartWeight(detailsPart))}</strong>
                </span>
                <span className={s.valueRow}>
                  <span>Support</span>
                  <strong>{detailsSupportCost.length > 0 ? detailsSupportCost.map((item) => `${item.label} ${item.formattedRequiredAmount}`).join(', ') : 'None'}</strong>
                </span>
              </div>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
};

export default BuildPage;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener('change', updateMatches);

    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}
