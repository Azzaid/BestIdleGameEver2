import { useRef, useState, useMemo, useCallback } from 'react';
import * as s from './BuildPage.css.ts';
import type { ColumnDef, ColumnFiltersState, VisibilityState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

// Define types for tower components
 type ComponentType = 'barrel' | 'base' | 'aimSystem' | 'ammo' | 'barrelAttachment' | 'loadingSystem' | 'launchSystem';
 
 interface TowerComponent {
   id: string;
   type: ComponentType;
   name: string;
   description: string;
   keywords: string[];
   // Additional properties could be added based on component type
 }
 
 // Example components (in a real app, these would come from a database or state management)
 const exampleComponents: Record<ComponentType, TowerComponent[]> = {
   barrel: [
     { id: 'barrel1', type: 'barrel', name: 'Standard Barrel', description: 'A basic barrel', keywords: ['standard', 'basic'] },
     { id: 'barrel2', type: 'barrel', name: 'Long Barrel', description: 'Increases range', keywords: ['long', 'range'] }
   ],
   base: [
     { id: 'base1', type: 'base', name: 'Fixed Base', description: 'Cannot rotate', keywords: ['fixed', 'stable'] },
     { id: 'base2', type: 'base', name: 'Rotating Base', description: 'Can rotate 360 degrees', keywords: ['rotating', 'mobile'] }
   ],
   aimSystem: [
     { id: 'aim1', type: 'aimSystem', name: 'Basic Targeting', description: 'Targets nearest enemy', keywords: ['basic', 'nearest'] },
     { id: 'aim2', type: 'aimSystem', name: 'Advanced Targeting', description: 'Targets strongest enemy', keywords: ['advanced', 'strongest'] }
   ],
   ammo: [
     { id: 'ammo1', type: 'ammo', name: 'Standard Shells', description: 'Basic ammunition', keywords: ['standard', 'basic'] },
     { id: 'ammo2', type: 'ammo', name: 'Explosive Shells', description: 'Area damage', keywords: ['explosive', 'area'] }
   ],
   barrelAttachment: [
     { id: 'attach1', type: 'barrelAttachment', name: 'Muzzle Brake', description: 'Reduces recoil', keywords: ['muzzle', 'recoil'] },
     { id: 'attach2', type: 'barrelAttachment', name: 'Silencer', description: 'Quieter firing', keywords: ['silent', 'stealth'] }
   ],
   loadingSystem: [
     { id: 'load1', type: 'loadingSystem', name: 'Manual Loading', description: 'Slow but reliable', keywords: ['manual', 'reliable'] },
     { id: 'load2', type: 'loadingSystem', name: 'Auto-Loader', description: 'Fast loading', keywords: ['auto', 'fast'] }
   ],
   launchSystem: [
     { id: 'launch1', type: 'launchSystem', name: 'Gunpowder', description: 'Traditional propellant', keywords: ['traditional', 'reliable'] },
     { id: 'launch2', type: 'launchSystem', name: 'Electromagnetic', description: 'High velocity', keywords: ['modern', 'velocity'] }
   ]
 };

 const componentTypeOrder: { key: ComponentType; label: string }[] = [
   { key: 'barrel', label: 'Barrel' },
   { key: 'base', label: 'Base' },
   { key: 'aimSystem', label: 'Aiming System' },
   { key: 'ammo', label: 'Ammunition' },
   { key: 'barrelAttachment', label: 'Barrel Attachment' },
   { key: 'loadingSystem', label: 'Loading System' },
   { key: 'launchSystem', label: 'Launch System' },
 ];
 
 const BuildPage = () => {
  // State to track selected components
  const [selectedComponents, setSelectedComponents] = useState<Record<ComponentType, TowerComponent | null>>({
    barrel: null,
    base: null,
    aimSystem: null,
    ammo: null,
    barrelAttachment: null,
    loadingSystem: null,
    launchSystem: null
  });

  // Active tab for parts listing
  const [activeTab, setActiveTab] = useState<ComponentType>('barrel');

  // Handle component selection (stable reference)
  const selectComponent = useCallback((component: TowerComponent) => {
    setSelectedComponents(prev => ({
      ...prev,
      [component.type]: component,
    }));
  }, []);

  // Data for the active tab (stable reference)
  const data = useMemo(() => exampleComponents[activeTab], [activeTab]);

  // TanStack Table: columns (stable reference)
  const columns: ColumnDef<TowerComponent, unknown>[] = useMemo(() => [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: info => info.getValue(),
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: info => info.getValue(),
    },
    {
      id: 'keywords',
      accessorFn: row => row.keywords.join(', '),
      header: 'Keywords',
      cell: info => {
        const row = info.row.original as TowerComponent;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {row.keywords.map(k => (
              <span key={k} className={s.keyword}>{k}</span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'select',
      header: 'Select',
      enableColumnFilter: false,
      cell: info => {
        const row = info.row.original as TowerComponent;
        const selected = selectedComponents[activeTab]?.id === row.id;
        return (
          <button onClick={() => selectComponent(row)}>
            {selected ? 'Selected' : 'Select'}
          </button>
        );
      },
    },
  ], [activeTab, selectedComponents, selectComponent]);

  // Column filters & visibility
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, columnVisibility },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Virtualizer over visible rows
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 48,
    overscan: 6,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div className={s.buildPage}>
      <h1>Assemble Your Tower</h1>
      <div className={s.towerPreview}>
        <div className={s.towerImage}>
          {/* This would be a visual representation of the tower with selected components */}
          <div className={s.towerPlaceholder}>Tower Preview</div>
        </div>
        <div className={s.towerStats}>
          <h3>Tower Stats</h3>
          <p>Based on your selected components, your tower will have these properties:</p>
          <ul>
            <li>Range: {selectedComponents.barrel ? 'Enhanced' : 'Standard'}</li>
            <li>Damage: {selectedComponents.ammo?.name === 'Explosive Shells' ? 'High' : 'Medium'}</li>
            <li>Fire Rate: {selectedComponents.loadingSystem?.name === 'Auto-Loader' ? 'Fast' : 'Slow'}</li>
            <li>Mobility: {selectedComponents.base?.name === 'Rotating Base' ? '360°' : 'Fixed'}</li>
          </ul>
        </div>
      </div>

      {/* Tabs for selecting component category */}
      <div className={s.tabsContainer}>
        {componentTypeOrder.map(({ key, label }) => (
          <button
            key={key}
            className={`${s.tabButton} ${activeTab === key ? s.tabButtonActive : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Column chooser and filters */}
      <div className={s.controlsRow}>
        <div className={s.columnChooser}>
          {table.getAllLeafColumns().map(col => (
            <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={col.getIsVisible()}
                onChange={col.getToggleVisibilityHandler()}
              />
              {col.columnDef.header as string}
            </label>
          ))}
        </div>
      </div>

      <div className={s.tableContainer} ref={scrollParentRef}>
        <table className={s.partsTable}>
          <thead className={s.tableHead}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className={s.tableRow}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className={s.tableHeaderCell}>
                    {header.isPlaceholder ? null : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                        {header.column.getCanFilter() && header.column.id !== 'select' ? (
                          <input
                            className={s.filterInput}
                            value={(header.column.getFilterValue() as string) ?? ''}
                            onChange={e => header.column.setFilterValue(e.target.value)}
                            placeholder={`Filter...`}
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
            {/* top spacer */}
            {virtualRows.length > 0 && (
              <tr style={{ height: virtualRows[0].start }}>
                <td colSpan={table.getAllLeafColumns().length} />
              </tr>
            )}

            {virtualRows.map(virtualRow => {
              const row = table.getRowModel().rows[virtualRow.index];
              const selected = selectedComponents[activeTab]?.id === row.original.id;
              return (
                <tr key={row.id} className={`${s.tableRow} ${selected ? s.selectedRow : ''}`}> 
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className={s.tableCell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* bottom spacer */}
            {virtualRows.length > 0 && (
              <tr style={{ height: totalSize - (virtualRows[virtualRows.length - 1].end) }}>
                <td colSpan={table.getAllLeafColumns().length} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuildPage;