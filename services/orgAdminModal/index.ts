import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const orgAdminModalReducer = (
  state: Store["orgAdminModal"] = initialState.orgAdminModal,
  action: ActionType
): Store["orgAdminModal"] => {
  switch (action.type) {
    case "SET_ADMIN_MODAL_OPEN":
      return { ...state, adminModalOpen: action.payload.adminModalOpen };
    case "SET_ADMIN_TAB":
      return { ...state, adminTab: action.payload.adminTab };
    case "SET_ORG_TAB":
      return { ...state, orgTab: action.payload.orgTab };
    case "SET_DOMAIN_TAB":
      return { ...state, domainTab: action.payload.domainTab };
    case "SET_DOMAIN_SELECT_TAB":
      return { ...state, domainSelectTab: action.payload.domainSelectTab };
    case "SET_EXISTING_TAB":
      return { ...state, existingTab: action.payload.existingTab };
    case "SET_NEW_TAB":
      return { ...state, newTab: action.payload.newTab };
    case "SET_PLAN_TAB":
      return { ...state, planTab: action.payload.planTab };
    case "CREATE_ORG_API_LOADING":
      return { ...state, isLoadingCreateOrg: true, isSuccessCreateOrg: false, isErrorCreateOrg: false, errorCreateOrg: null };
    case "CREATE_ORG_API_SUCCESS":
      return { ...state, isLoadingCreateOrg: false, isSuccessCreateOrg: true, isErrorCreateOrg: false, errorCreateOrg: null };
    case "CREATE_ORG_API_FAILURE":
      return {
        ...state,
        isLoadingCreateOrg: false,
        isSuccessCreateOrg: false,
        isErrorCreateOrg: true,
        errorCreateOrg: (action as any).error?.message || "Failed to create organisation",
      };
    case "CREATE_ORG_API_CLEAR":
      return { ...state, isLoadingCreateOrg: false, isSuccessCreateOrg: false, isErrorCreateOrg: false, errorCreateOrg: null };
    case "RESET_ADMIN_MODAL":
      return initialState.orgAdminModal;
    default:
      return state;
  }
};
