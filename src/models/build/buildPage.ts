import type { UpkeepTypesValue } from '../Upkeep.ts';

export interface SupportStatusItem {
  resource: UpkeepTypesValue;
  label: string;
  requiredAmount: number;
  availableAmount: number;
  missingAmount: number;
}
