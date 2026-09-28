import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const projectReducer = (
  state: Store["project"] = initialState.project,
  action: ActionType
): Store["project"] => {
  switch (action.type) {
    // ── Get List ──────────────────────────────────────────────────────────────
    case "PROJECT_GETLIST_API_LOADING":
      return { ...state, isLoadingGetList: true, isSuccessGetList: false, isErrorGetList: false };
    case "PROJECT_GETLIST_API_SUCCESS":
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: true,
        isErrorGetList: false,
        projectList:
          (action as any).payload?.data?.content ||
          (action as any).payload?.data ||
          (action as any).payload ||
          [],
        totalElements: (action as any).payload?.data?.totalElements ?? state.totalElements,
        totalPages: (action as any).payload?.data?.totalPages ?? state.totalPages,
      };
    case "PROJECT_GETLIST_API_FAILURE":
      return { ...state, isLoadingGetList: false, isSuccessGetList: false, isErrorGetList: true };

    // ── Create ───────────────────────────────────────────────────────────────
    case "PROJECT_CREATE_API_LOADING":
      return { ...state, isLoadingCreate: true, isSuccessCreate: false, isErrorCreate: false };
    case "PROJECT_CREATE_API_SUCCESS":
      return { ...state, isLoadingCreate: false, isSuccessCreate: true, isErrorCreate: false };
    case "PROJECT_CREATE_API_FAILURE":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: true };
    case "PROJECT_CREATE_API_CLEAR":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: false };

    // ── Update ───────────────────────────────────────────────────────────────
    case "PROJECT_UPDATE_API_LOADING":
      return { ...state, isLoadingUpdate: true, isSuccessUpdate: false, isErrorUpdate: false };
    case "PROJECT_UPDATE_API_SUCCESS":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: true, isErrorUpdate: false };
    case "PROJECT_UPDATE_API_FAILURE":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: false, isErrorUpdate: true };
    case "PROJECT_UPDATE_API_CLEAR":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: false, isErrorUpdate: false };

    // ── Delete ───────────────────────────────────────────────────────────────
    case "PROJECT_DELETE_API_LOADING":
      return { ...state, isLoadingDelete: true, isSuccessDelete: false, isErrorDelete: false };
    case "PROJECT_DELETE_API_SUCCESS":
      return { ...state, isLoadingDelete: false, isSuccessDelete: true, isErrorDelete: false };
    case "PROJECT_DELETE_API_FAILURE":
      return { ...state, isLoadingDelete: false, isSuccessDelete: false, isErrorDelete: true };
    case "PROJECT_DELETE_API_CLEAR":
      return { ...state, isLoadingDelete: false, isSuccessDelete: false, isErrorDelete: false };

    // ── Set Selected Project ──────────────────────────────────────────────────
    case "SET_SELECTED_PROJECT":
      return { ...state, selectedProject: (action as any).payload || null };

    default:
      return state;
  }
};
