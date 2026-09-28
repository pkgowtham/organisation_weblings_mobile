import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const genderReducer = createListReducer("GENDER", initialState.gender);
