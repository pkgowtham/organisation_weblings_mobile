import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const clientReducer = (
  state: Store["client"] = initialState.client,
  action: ActionType
): Store["client"] => {
  switch (action.type) {
    // ── Get List ──────────────────────────────────────────────────────────────
    case "CLIENT_GETLIST_API_LOADING":
      return { ...state, isLoadingGetList: true, isSuccessGetList: false, isErrorGetList: false };
    case "CLIENT_GETLIST_API_SUCCESS":
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: true,
        isErrorGetList: false,
        clientList:
          (action as any).payload?.data?.content ||
          (action as any).payload?.data ||
          (action as any).payload ||
          [],
        totalElements: (action as any).payload?.data?.totalElements ?? state.totalElements,
        totalPages: (action as any).payload?.data?.totalPages ?? state.totalPages,
      };
    case "CLIENT_GETLIST_API_FAILURE":
      return { ...state, isLoadingGetList: false, isSuccessGetList: false, isErrorGetList: true };

    // ── Create ───────────────────────────────────────────────────────────────
    case "CLIENT_CREATE_API_LOADING":
      return { ...state, isLoadingCreate: true, isSuccessCreate: false, isErrorCreate: false };
    case "CLIENT_CREATE_API_SUCCESS":
      return { ...state, isLoadingCreate: false, isSuccessCreate: true, isErrorCreate: false };
    case "CLIENT_CREATE_API_FAILURE":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: true };
    case "CLIENT_CREATE_API_CLEAR":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: false };

    // ── Update ───────────────────────────────────────────────────────────────
    case "CLIENT_UPDATE_API_LOADING":
      return { ...state, isLoadingUpdate: true, isSuccessUpdate: false, isErrorUpdate: false };
    case "CLIENT_UPDATE_API_SUCCESS":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: true, isErrorUpdate: false };
    case "CLIENT_UPDATE_API_FAILURE":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: false, isErrorUpdate: true };
    case "CLIENT_UPDATE_API_CLEAR":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: false, isErrorUpdate: false };

    // ── Delete / Destroy ─────────────────────────────────────────────────────
    case "CLIENT_DELETE_API_LOADING":
    case "CLIENT_DESTROY_API_LOADING":
      return { ...state, isLoadingDelete: true, isSuccessDelete: false, isErrorDelete: false };
    case "CLIENT_DELETE_API_SUCCESS":
    case "CLIENT_DESTROY_API_SUCCESS":
      return { ...state, isLoadingDelete: false, isSuccessDelete: true, isErrorDelete: false };
    case "CLIENT_DELETE_API_FAILURE":
    case "CLIENT_DESTROY_API_FAILURE":
      return { ...state, isLoadingDelete: false, isSuccessDelete: false, isErrorDelete: true };
    case "CLIENT_DELETE_API_CLEAR":
    case "CLIENT_DESTROY_API_CLEAR":
      return { ...state, isLoadingDelete: false, isSuccessDelete: false, isErrorDelete: false };

    default:
      return state;
  }
};
