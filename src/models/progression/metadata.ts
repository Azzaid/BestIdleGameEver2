import type {DevelopmentVectorKey} from "../DevlopmentVector.ts";

export type ProgressionMetadata = {
  vector?: DevelopmentVectorKey;
  level?: number;
  branch?: string;
};
