import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type BuildingSelectorProps = {
    onBuild: (buildingId: string, activeVector: DevelopmentVectorValue) => void;
    activeVector: DevelopmentVectorValue;
    onActiveVectorChange: (activeVector: DevelopmentVectorValue) => void;
    unlockedBuildingIds: ReadonlySet<string>;
    unavailableBuildingReasons?: Readonly<Record<string, string>>;
    blocked?: boolean;
    blockedReason?: string;
};

export type HexTilePreviewProps = {
    imageUrl?: string;
    imageZoom?: number;
    imageShift?: {x: number; y: number};
    size?: number;
    padding?: number;
    fit?: "cover" | "contain";
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    ariaLabel?: string;
};
