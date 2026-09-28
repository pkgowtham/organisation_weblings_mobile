import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const planReducer = (
  state: Store["plan"] = initialState.plan,
  action: ActionType
): Store["plan"] => {
  switch (action.type) {
    case "GET_PLANS_LIST_API_LOADING":
      return {
        ...state,
        isLoadingGetPlans: true,
        isSuccessGetPlans: false,
        isErrorGetPlans: false,
        errorGetPlans: null,
      };
    case "GET_PLANS_LIST_API_SUCCESS":
      return {
        ...state,
        isLoadingGetPlans: false,
        isSuccessGetPlans: true,
        isErrorGetPlans: false,
        errorGetPlans: null,
        plansData: (action as any).payload?.data || (action as any).payload || [],
      };
    case "GET_PLANS_LIST_API_FAILURE":
      return {
        ...state,
        isLoadingGetPlans: false,
        isSuccessGetPlans: false,
        isErrorGetPlans: true,
        errorGetPlans: (action as any).error?.message || "Failed to fetch plans",
      };
    case "GET_PLANS_LIST_API_CLEAR":
      return {
        ...state,
        isLoadingGetPlans: false,
        isSuccessGetPlans: false,
        isErrorGetPlans: false,
        errorGetPlans: null,
      };
    default:
      return state;
  }
};
