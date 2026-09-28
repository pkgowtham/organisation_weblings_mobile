import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const teamReducer = (
  state: Store["team"] = initialState.team,
  action: ActionType
): Store["team"] => {
  switch (action.type) {
    // ── Get List ──────────────────────────────────────────────────────────────
    case "TEAMS_GETLIST_API_LOADING":
    case "TEAM_GETLIST_API_LOADING":
      return { ...state, isLoadingGetList: true, isSuccessGetList: false, isErrorGetList: false };
    case "TEAMS_GETLIST_API_SUCCESS":
    case "TEAM_GETLIST_API_SUCCESS":
      return {
        ...state,
        isLoadingGetList: false,
        isSuccessGetList: true,
        isErrorGetList: false,
        teamList:
          (action as any).payload?.data?.content ||
          (action as any).payload?.data ||
          (action as any).payload ||
          [],
        totalElements: (action as any).payload?.data?.totalElements ?? state.totalElements,
        totalPages: (action as any).payload?.data?.totalPages ?? state.totalPages,
      };
    case "TEAMS_GETLIST_API_FAILURE":
    case "TEAM_GETLIST_API_FAILURE":
      return { ...state, isLoadingGetList: false, isSuccessGetList: false, isErrorGetList: true };

    // ── Create ───────────────────────────────────────────────────────────────
    case "TEAMS_CREATE_API_LOADING":
    case "TEAM_CREATE_API_LOADING":
      return { ...state, isLoadingCreate: true, isSuccessCreate: false, isErrorCreate: false };
    case "TEAMS_CREATE_API_SUCCESS":
    case "TEAM_CREATE_API_SUCCESS":
      return { ...state, isLoadingCreate: false, isSuccessCreate: true, isErrorCreate: false };
    case "TEAMS_CREATE_API_FAILURE":
    case "TEAM_CREATE_API_FAILURE":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: true };
    case "TEAMS_CREATE_API_CLEAR":
    case "TEAM_CREATE_API_CLEAR":
      return { ...state, isLoadingCreate: false, isSuccessCreate: false, isErrorCreate: false };

    // ── Update ───────────────────────────────────────────────────────────────
    case "TEAMS_UPDATE_API_LOADING":
    case "TEAMS_WITH_MEMBERS_UPDATE_API_LOADING":
    case "TEAM_UPDATE_API_LOADING":
      return { ...state, isLoadingUpdate: true, isSuccessUpdate: false, isErrorUpdate: false };
    case "TEAMS_UPDATE_API_SUCCESS":
    case "TEAMS_WITH_MEMBERS_UPDATE_API_SUCCESS":
    case "TEAM_UPDATE_API_SUCCESS":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: true, isErrorUpdate: false };
    case "TEAMS_UPDATE_API_FAILURE":
    case "TEAMS_WITH_MEMBERS_UPDATE_API_FAILURE":
    case "TEAM_UPDATE_API_FAILURE":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: false, isErrorUpdate: true };
    case "TEAMS_UPDATE_API_CLEAR":
    case "TEAMS_WITH_MEMBERS_UPDATE_API_CLEAR":
    case "TEAM_UPDATE_API_CLEAR":
      return { ...state, isLoadingUpdate: false, isSuccessUpdate: false, isErrorUpdate: false };

    // ── Delete / Destroy ────────────────────────────────────────────────────
    case "TEAMS_DESTROY_API_LOADING":
    case "TEAM_DELETE_API_LOADING":
      return { ...state, isLoadingDelete: true, isSuccessDelete: false, isErrorDelete: false };
    case "TEAMS_DESTROY_API_SUCCESS":
    case "TEAM_DELETE_API_SUCCESS":
      return { ...state, isLoadingDelete: false, isSuccessDelete: true, isErrorDelete: false };
    case "TEAMS_DESTROY_API_FAILURE":
    case "TEAM_DELETE_API_FAILURE":
      return { ...state, isLoadingDelete: false, isSuccessDelete: false, isErrorDelete: true };
    case "TEAMS_DESTROY_API_CLEAR":
    case "TEAM_DELETE_API_CLEAR":
      return { ...state, isLoadingDelete: false, isSuccessDelete: false, isErrorDelete: false };

    default:
      return state;
  }
};
