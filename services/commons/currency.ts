import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const currencyReducer = createListReducer("CURRENCY", initialState.currency);
