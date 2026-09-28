import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const employeeReducer = (
  state: any = { employeeList: [], isLoadingGetList: false, isSuccessGetList: false, isErrorGetList: false },
  action: ActionType
): any => {
  switch (action.type) {
    case "EMPLOYEE_LIST_GETLIST_API_LOADING":
      return { ...state, isLoadingGetList: true, isSuccessGetList: false, isErrorGetList: false };
    case "EMPLOYEE_LIST_GETLIST_API_SUCCESS":
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: true,
        isErrorGetList: false,
        employeeList:
          (action as any).payload?.data?.content ||
          (action as any).payload?.data ||
          (action as any).payload ||
          [],
        totalElements: (action as any).payload?.data?.totalElements ?? state.totalElements,
        totalPages: (action as any).payload?.data?.totalPages ?? state.totalPages,
      };
    case "EMPLOYEE_LIST_GETLIST_API_FAILURE":
      return { ...state, isLoadingGetList: false, isSuccessGetList: false, isErrorGetList: true };

    default:
      return state;
  }
};
