import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const natureOfBusinessReducer = createListReducer("NATURE", initialState.natureOfBusiness);
