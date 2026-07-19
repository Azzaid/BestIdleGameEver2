import type { DamageProfile } from './damage.ts';

export interface InfectionApplication {
  durationSeconds: number;
  stacks: number;
  maxStacks: number;
  slowPerStack: number;
  damagePerSecondPerStack: number;
  damageProfile: DamageProfile;
}

export interface InfectionStatus {
  remainingSeconds: number;
  stacks: number;
  maxStacks: number;
  slowPerStack: number;
  damagePerSecondPerStack: number;
  damageProfile: DamageProfile;
}
