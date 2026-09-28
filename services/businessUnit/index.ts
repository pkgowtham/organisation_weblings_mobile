import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const businessUnitReducer = (
  state: Store["businessUnit"] = initialState.businessUnit,
  action: ActionType
): Store["businessUnit"] => {
  switch (action.type) {
    // ── Get Business Unit List ──────────────────────────────────────────────
    case "BU_GETLIST_API_LOADING":
      return {
        ...state,
        isLoadingGetList: true,
        isSuccessGetList: false,
        isErrorGetList: false,
      };
    case "BU_GETLIST_API_SUCCESS": {
      const p = (action as any).payload;
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: true,
        isErrorGetList: false,
        businessUnitList:
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
    case "BU_GETLIST_API_FAILURE":
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: false,
        isErrorGetList: true,
      };

    // ── Get Business Unit Detail ────────────────────────────────────────────
    case "BU_DETAIL_API_LOADING":
      return { ...state, isLoadingDetail: true, isSuccessDetail: false, isErrorDetail: false };
    case "BU_DETAIL_API_SUCCESS":
      return {
        ...state,
        isLoadingDetail: false,
        isSuccessDetail: true,
        isErrorDetail: false,
        selectedBusinessUnit:
          (action as any).payload?.data || (action as any).payload || null,
      };
    case "BU_DETAIL_API_FAILURE":
      return { ...state, isLoadingDetail: false, isSuccessDetail: false, isErrorDetail: true };

    // ── Create Business Unit ────────────────────────────────────────────────
    case "BU_CREATE_API_LOADING":
      return {
        ...state,
        isLoadingCreate: true,
        isSuccessCreate: false,
        isErrorCreate: false,
      };
    case "BU_CREATE_API_SUCCESS":
      return {
        ...state,
        isLoadingCreate: false,
        isSuccessCreate: true,
        isErrorCreate: false,
      };
    case "BU_CREATE_API_FAILURE":
      return {
        ...state,
        isLoadingCreate: false,
        isSuccessCreate: false,
        isErrorCreate: true,
      };
    case "BU_CREATE_API_CLEAR":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: false };

    // ── Set Selected Business Unit ──────────────────────────────────────────
    case "SET_SELECTED_BU":
      return { ...state, selectedBusinessUnit: (action as any).payload || null };

    default:
      return state;
  }
};
