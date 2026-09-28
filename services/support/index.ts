import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const supportReducer = (
  state: Store["support"] = initialState.support,
  action: ActionType
): Store["support"] => {
  switch (action.type) {
    // ── Support Types ────────────────────────────────────────────────────────
    case "SUPPORT_TYPES_GETLIST_API_LOADING":
      return { ...state, isLoadingSupportTypes: true, isErrorSupportTypes: false };
    case "SUPPORT_TYPES_GETLIST_API_SUCCESS":
      return {
        ...state,
        isLoadingSupportTypes: false,
        isSuccessSupportTypes: true,
        isErrorSupportTypes: false,
        supportTypes:
          (action as any).payload?.data?.content ||
          (action as any).payload?.data ||
          (action as any).payload ||
          [],
      };
    case "SUPPORT_TYPES_GETLIST_API_FAILURE":
      return { ...state, isLoadingSupportTypes: false, isErrorSupportTypes: true };

    // ── Related Module ───────────────────────────────────────────────────────
    case "RELATED_MODULE_GETLIST_API_LOADING":
      return { ...state, isLoadingRelatedModule: true, isErrorRelatedModule: false };
    case "RELATED_MODULE_GETLIST_API_SUCCESS":
      return {
        ...state,
        isLoadingRelatedModule: false,
        isSuccessRelatedModule: true,
        isErrorRelatedModule: false,
        relatedModules:
          (action as any).payload?.data?.content ||
          (action as any).payload?.data ||
          (action as any).payload ||
          [],
      };
    case "RELATED_MODULE_GETLIST_API_FAILURE":
      return { ...state, isLoadingRelatedModule: false, isErrorRelatedModule: true };

    // ── Create Support Ticket ────────────────────────────────────────────────
    case "SUPPORT_TICKET_CREATE_API_LOADING":
      return { ...state, isLoadingCreate: true, isSuccessCreate: false, isErrorCreate: false };
    case "SUPPORT_TICKET_CREATE_API_SUCCESS":
      return { ...state, isLoadingCreate: false, isSuccessCreate: true, isErrorCreate: false };
    case "SUPPORT_TICKET_CREATE_API_FAILURE":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: true };
    case "SUPPORT_TICKET_CREATE_API_CLEAR":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: false };

    default:
      return state;
  }
};
