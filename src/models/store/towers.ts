import type { TowerPartSlot } from '../battle/towerParts.ts';

export interface StoredTowerAssembly {
  id: string;
  name: string;
  selectedPartIds: Partial<Record<TowerPartSlot, string>>;
}

export interface TowersState {
  activeTowerId: string;
  towers: Record<string, StoredTowerAssembly>;
  towerDrafts: Record<string, Partial<Record<TowerPartSlot, string>>>;
}
