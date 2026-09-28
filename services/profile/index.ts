import type { ActionType } from "../../store/action.types";
import { initialState } from "../../store/initialState";
import type { Store } from "../../store/store.types";

export const profileReducer = (
  state: Store["profile"] = initialState.profile,
  action: ActionType
): Store["profile"] => {
  switch (action.type) {
    // ── Get Profile ────────────────────────────────────────────────────────
    case "GET_PROFILE_API_LOADING":
      return {
        ...state,
        isLoadingGetProfile: true,
        isSuccessGetProfile: false,
        isErrorGetProfile: false,
        errorGetProfile: null,
      };
    case "GET_PROFILE_API_SUCCESS":
      return {
        ...state,
        isLoadingGetProfile: false,
        isSuccessGetProfile: true,
        isErrorGetProfile: false,
        errorGetProfile: null,
        profileData: (action as any).payload?.data || (action as any).payload || null,
      };
    case "GET_PROFILE_API_FAILURE":
      return {
        ...state,
        isLoadingGetProfile: false,
        isSuccessGetProfile: false,
        isErrorGetProfile: true,
        errorGetProfile: (action as any).error?.message || "Failed to fetch profile",
      };
    case "GET_PROFILE_API_CLEAR":
      return {
        ...state,
        isLoadingGetProfile: false,
        isSuccessGetProfile: false,
        isErrorGetProfile: false,
        errorGetProfile: null,
      };

    // ── Update Profile ─────────────────────────────────────────────────────
    case "UPDATE_PROFILE_API_LOADING":
      return {
        ...state,
        isLoadingUpdateProfile: true,
        isSuccessUpdateProfile: false,
        isErrorUpdateProfile: false,
        errorUpdateProfile: null,
      };
    case "UPDATE_PROFILE_API_SUCCESS":
      return {
        ...state,
        isLoadingUpdateProfile: false,
        isSuccessUpdateProfile: true,
        isErrorUpdateProfile: false,
        errorUpdateProfile: null,
      };
    case "UPDATE_PROFILE_API_FAILURE":
      return {
        ...state,
        isLoadingUpdateProfile: false,
        isSuccessUpdateProfile: false,
        isErrorUpdateProfile: true,
        errorUpdateProfile: (action as any).error?.message || "Failed to update profile",
      };
    case "UPDATE_PROFILE_API_CLEAR":
      return {
        ...state,
        isLoadingUpdateProfile: false,
        isSuccessUpdateProfile: false,
        isErrorUpdateProfile: false,
        errorUpdateProfile: null,
      };

    // ── Upload Display Picture (DP) ─────────────────────────────────────────
    case "UPLOAD_DP_API_LOADING":
      return {
        ...state,
        isLoadingUploadDp: true,
        isSuccessUploadDp: false,
        isErrorUploadDp: false,
      };
    case "UPLOAD_DP_API_SUCCESS":
      return {
        ...state,
        isLoadingUploadDp: false,
        isSuccessUploadDp: true,
        isErrorUploadDp: false,
        uploadedDpData: (action as any).payload?.data || (action as any).payload || null,
      };
    case "UPLOAD_DP_API_FAILURE":
      return {
        ...state,
        isLoadingUploadDp: false,
        isSuccessUploadDp: false,
        isErrorUploadDp: true,
      };
    case "UPLOAD_DP_API_CLEAR":
      return {
        ...state,
        isLoadingUploadDp: false,
        isSuccessUploadDp: false,
        isErrorUploadDp: false,
        uploadedDpData: null,
      };

    default:
      return state;
  }
};
