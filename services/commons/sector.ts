import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const sectorReducer = createListReducer("SECTOR", initialState.sector);
