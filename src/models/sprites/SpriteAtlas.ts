import type {DevelopmentVectorValue} from "../DevlopmentVector.ts";

export type SpriteAsset<Metadata = unknown> = {
    src: string;
    metadata?: Metadata;
};

export type SpriteList<Metadata = unknown> = Record<string, SpriteAsset<Metadata>>;
export type SpriteAtlas<Metadata = unknown> = Record<DevelopmentVectorValue, SpriteList<Metadata>>;

