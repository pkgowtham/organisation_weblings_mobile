import { createListReducer } from "./createListReducer";
import { initialState } from "@/store/initialState";

export const billingTypeReducer = createListReducer("BILLING_TYPE", initialState.billingType);
