import type {WallBuilding} from "../../../models/city/Wall.ts";
import {DEVELOPMENT_VECTORS} from "../../../models/DevlopmentVector.ts";
import {superstructures} from "../../identificators/index.ts";
import {createWallFactory} from "../wallFactory.ts";

const {tower} = createWallFactory({
    vector: DEVELOPMENT_VECTORS.medieval,
});

export const medievalWallSuperstructures: Record<string, WallBuilding> = {
    [superstructures.medieval.oldStump]: tower(
        superstructures.medieval.oldStump,
        "Old stump",
        "An old stump provides some flat space to mount gun on",
    ),
};
