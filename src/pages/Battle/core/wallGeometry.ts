import { BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX, CITY_HEX_SIZE } from '../../../data/constants.ts';
import type { BattleWallSegment } from '../../../models/battle/wallSegment.ts';
import { wallSpriteMetadataAtlas } from '../../../models/sprites/walls/wallsSpriteAtlas.ts';

export function getWallContactY({
    wallY,
    wallSegments,
    segmentSize = BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX,
}: {
    wallY: number;
    wallSegments: BattleWallSegment[];
    segmentSize?: number;
}) {
    if (wallSegments.length === 0) return wallY - 8;

    const cityToBattleScale = segmentSize / CITY_HEX_SIZE;
    const nearestWallEdgeOffset = wallSegments.reduce((nearestOffset, segment) => {
        const wallSpriteMetadata = segment.wallKey && segment.wallDevelopmentVector
            ? wallSpriteMetadataAtlas[segment.wallDevelopmentVector][segment.wallKey]
            : undefined;

        if (!wallSpriteMetadata) return Math.max(nearestOffset, segmentSize / 2);

        const spriteHeight = wallSpriteMetadata.targetSpriteSize.height * cityToBattleScale;
        const spriteTopOffset = spriteHeight / 2;
        const visibleTopOffset = wallSpriteMetadata.sourceVisibleBounds
            ? wallSpriteMetadata.sourceVisibleBounds.y
                / wallSpriteMetadata.sourceSpriteSize.height
                * spriteHeight
            : 0;

        return Math.max(nearestOffset, spriteTopOffset - visibleTopOffset);
    }, 0);

    return wallY - nearestWallEdgeOffset;
}
