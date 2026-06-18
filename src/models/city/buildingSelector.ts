import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type BuildingSelectorProps = {
    onBuild: (buildingId: string, activeVector: DevelopmentVectorValue) => void;
    unlockedBuildingIds: ReadonlySet<string>;
    unavailableBuildingReasons?: Readonly<Record<string, string>>;
    blocked?: boolean;
    blockedReason?: string;
};

export type HexTilePreviewProps = {
    imageUrl?: string;
    size?: number;
    padding?: number;
    fit?: "cover" | "contain";
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    ariaLabel?: string;
};
