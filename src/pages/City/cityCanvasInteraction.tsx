import {createContext, useContext, type Dispatch, type ReactNode, type SetStateAction} from "react";
import type {HexCell} from "../../models/city/HexGrid.ts";
import type {CityExpansionSideId} from "../../models/city/expansion.ts";

type CityCanvasInteractionState = {
    selectedHex: HexCell | null;
    setSelectedHex: Dispatch<SetStateAction<HexCell | null>>;
    confirmingExpansionSide: CityExpansionSideId | null;
    setConfirmingExpansionSide: Dispatch<SetStateAction<CityExpansionSideId | null>>;
};

const CityCanvasInteractionContext = createContext<CityCanvasInteractionState | null>(null);

export function CityCanvasInteractionProvider({
    value,
    children,
}: {
    value: CityCanvasInteractionState;
    children: ReactNode;
}) {
    return (
        <CityCanvasInteractionContext.Provider value={value}>
            {children}
        </CityCanvasInteractionContext.Provider>
    );
}

export function useCityCanvasInteraction() {
    const context = useContext(CityCanvasInteractionContext);
    if (!context) {
        throw new Error("useCityCanvasInteraction must be used inside CityCanvasInteractionProvider");
    }

    return context;
}
