export type BuildingSelectorProps = {
    onBuild: (buildingId: string, activeVector: symbol) => void;
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
