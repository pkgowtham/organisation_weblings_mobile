import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const countryReducer = createListReducer("COUNTRY", initialState.country);
