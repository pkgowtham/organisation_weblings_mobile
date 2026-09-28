import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const organisationBasicReducer = (
  state: Store["organisationBasic"] = initialState.organisationBasic,
  action: ActionType
): Store["organisationBasic"] => {
  switch (action.type) {
    // ── Get Organisation Basic Details ────────────────────────────────────
    case "GET_ORG_BASIC_API_LOADING":
      return {
        ...state,
        isLoadingGetOrgBasic: true,
        isSuccessGetOrgBasic: false,
        isErrorGetOrgBasic: false,
        errorGetOrgBasic: null,
      };
    case "GET_ORG_BASIC_API_SUCCESS":
      return {
        ...state,
        isLoadingGetOrgBasic: false,
        isSuccessGetOrgBasic: true,
        isErrorGetOrgBasic: false,
        errorGetOrgBasic: null,
        organisationBasicData:
          (action as any).payload?.data || (action as any).payload || null,
      };
    case "GET_ORG_BASIC_API_FAILURE":
      return {
        ...state,
        isLoadingGetOrgBasic: false,
        isSuccessGetOrgBasic: false,
        isErrorGetOrgBasic: true,
        errorGetOrgBasic:
          (action as any).error?.message || "Failed to fetch organisation details",
      };
    case "GET_ORG_BASIC_API_CLEAR":
      return {
        ...state,
        isLoadingGetOrgBasic: false,
        isSuccessGetOrgBasic: false,
        isErrorGetOrgBasic: false,
        errorGetOrgBasic: null,
      };

    // ── Create Organisation Basic ──────────────────────────────────────────
    case "CREATE_ORG_BASIC_API_LOADING":
      return {
        ...state,
        isLoadingCreateOrgBasic: true,
        isSuccessCreateOrgBasic: false,
        isErrorCreateOrgBasic: false,
        errorCreateOrgBasic: null,
      };
    case "CREATE_ORG_BASIC_API_SUCCESS":
    case "CREATE_ORG_API_SUCCESS":
      return {
        ...state,
        isLoadingCreateOrgBasic: false,
        isSuccessCreateOrgBasic: true,
        isErrorCreateOrgBasic: false,
        errorCreateOrgBasic: null,
        organisationBasicData:
          (action as any).payload?.data || (action as any).payload || state.organisationBasicData,
      };
    case "CREATE_ORG_BASIC_API_FAILURE":
      return {
        ...state,
        isLoadingCreateOrgBasic: false,
        isSuccessCreateOrgBasic: false,
        isErrorCreateOrgBasic: true,
        errorCreateOrgBasic:
          (action as any).error?.message || "Failed to create organisation",
      };
    case "CREATE_ORG_BASIC_API_CLEAR":
      return {
        ...state,
        isLoadingCreateOrgBasic: false,
        isSuccessCreateOrgBasic: false,
        isErrorCreateOrgBasic: false,
        errorCreateOrgBasic: null,
      };

    // ── Update Organisation Basic ──────────────────────────────────────────
    case "UPDATE_ORG_BASIC_API_LOADING":
      return {
        ...state,
        isLoadingUpdateOrgBasic: true,
        isSuccessUpdateOrgBasic: false,
        isErrorUpdateOrgBasic: false,
        errorUpdateOrgBasic: null,
      };
    case "UPDATE_ORG_BASIC_API_SUCCESS":
      return {
        ...state,
        isLoadingUpdateOrgBasic: false,
        isSuccessUpdateOrgBasic: true,
        isErrorUpdateOrgBasic: false,
        errorUpdateOrgBasic: null,
        organisationBasicData:
          (action as any).payload?.data || (action as any).payload || state.organisationBasicData,
      };
    case "UPDATE_ORG_BASIC_API_FAILURE":
      return {
        ...state,
        isLoadingUpdateOrgBasic: false,
        isSuccessUpdateOrgBasic: false,
        isErrorUpdateOrgBasic: true,
        errorUpdateOrgBasic:
          (action as any).error?.message || "Failed to update organisation details",
      };
    case "UPDATE_ORG_BASIC_API_CLEAR":
      return {
        ...state,
        isLoadingUpdateOrgBasic: false,
        isSuccessUpdateOrgBasic: false,
        isErrorUpdateOrgBasic: false,
        errorUpdateOrgBasic: null,
      };

    default:
      return state;
  }
};
