import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const cityReducer = createListReducer("CITY", initialState.city);
