import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const businessUnitLocationReducer = (
  state: Store["businessUnitLocation"] = initialState.businessUnitLocation,
  action: ActionType
): Store["businessUnitLocation"] => {
  switch (action.type) {
    // ── Get Business Unit Location List ──────────────────────────────────────
    case "BUL_GETLIST_API_LOADING":
      return {
        ...state,
        isLoadingGetList: true,
        isSuccessGetList: false,
        isErrorGetList: false,
      };
    case "BUL_GETLIST_API_SUCCESS": {
      const p = (action as any).payload;
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: true,
        isErrorGetList: false,
        businessUnitLocationList:
          p?.data?.content ||
          p?.data ||
          p ||
          [],
        totalElements:
          p?.data?.totalElements ??
          p?.meta?.totalRecords ??
          state.totalElements,
        totalPages:
          p?.data?.totalPages ??
          p?.meta?.totalPages ??
          state.totalPages,
      };
    }
    case "BUL_GETLIST_API_FAILURE":
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: false,
        isErrorGetList: true,
      };

    // ── Create Business Unit Location ──────────────────────────────────────
    case "BUL_CREATE_API_LOADING":
      return {
        ...state,
        isLoadingCreate: true,
        isSuccessCreate: false,
        isErrorCreate: false,
      };
    case "BUL_CREATE_API_SUCCESS":
      return {
        ...state,
        isLoadingCreate: false,
        isSuccessCreate: true,
        isErrorCreate: false,
      };
    case "BUL_CREATE_API_FAILURE":
      return {
        ...state,
        isLoadingCreate: false,
        isSuccessCreate: false,
        isErrorCreate: true,
      };
    case "BUL_CREATE_API_CLEAR":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: false };

    // ── Reset Password Business Unit Location ────────────────────────────────
    case "BUL_RESET_PASSWORD_API_LOADING":
      return {
        ...state,
        isLoadingResetPassword: true,
        isSuccessResetPassword: false,
        isErrorResetPassword: false,
      };
    case "BUL_RESET_PASSWORD_API_SUCCESS":
      return {
        ...state,
        isLoadingResetPassword: false,
        isSuccessResetPassword: true,
        isErrorResetPassword: false,
      };
    case "BUL_RESET_PASSWORD_API_FAILURE":
      return {
        ...state,
        isLoadingResetPassword: false,
        isSuccessResetPassword: false,
        isErrorResetPassword: true,
      };
    case "BUL_RESET_PASSWORD_API_CLEAR":
      return { ...state, isLoadingResetPassword: false, isSuccessResetPassword: false, isErrorResetPassword: false };

    // ── Set Selected Business Unit Location ────────────────────────────────
    case "SET_SELECTED_BUL":
      return { ...state, selectedBusinessUnitLocation: (action as any).payload || null };

    default:
      return state;
  }
};
