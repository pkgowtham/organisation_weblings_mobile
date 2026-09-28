import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const typeOfBusinessReducer = createListReducer("TYPE", initialState.typeOfBusiness);
