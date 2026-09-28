import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const stateReducer = createListReducer("STATE", initialState.state);
