import { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import { Store } from "@/store/store.types";


export const commonInternalReducer = (
  state: Store["commonInternal"] = initialState.commonInternal,
  action: ActionType
): any => {
  switch (action.type) {
    case "APP_LOADER":
      return {
        ...state,
        loading: action.payload.loading,
      };
    case "UPDATE_APP_SIDEBAR":
      return {
        ...state,
        isCollapsed: action.payload.isCollapsed,
      };
    case "UPDATE_DELETE_MODAL":
      return {
        ...state,
        showDeleteModel: action.payload.showDeleteModel,
      };
    case "UPDATE_THEME_COLOR":
      return {
        ...state,
        light: action.payload.light,
      };
    case "UPDATE_CHAT_COUNT":
      return {
        ...state,
        totalUnreadCount: action.payload.totalUnreadCount,
      };
    case "UPDATE_DATE_PICKER_MODAL":
      return {
        ...state,
        isCalenderOpen: action.payload.isCalenderOpen,
      };
    case "UPDATE_FILE_URL":
      return {
        ...state,
        fileUrl: action.payload.fileUrl,
      };
    case "STORE_MEMBER_DETAILS":
      return {
        ...state,
        memberTemp: action.payload.memberTemp,
      };
    case "UPDATE_FILE_ATTACHMENTS":
      return {
        ...state,
        addAttachment: action.payload.addAttachment,
      };
    case "STORE_SIGNUP_RESPONSE":
      return {
        ...state,
        societyResponse: action.payload.societyResponse,
      };
    case "STORE_AUTH_RESPONSE":
      return {
        ...state,
        authResponse: action.payload.authResponse,
      };
    case "STORE_LOGIN_RESPONSE":
      return {
        ...state,
        loginResponse: action.payload.loginResponse,
      };
    case "STORE_VISITOR_INPUT":
      return {
        ...state,
        visitorDetail: action.payload.visitorDetail,
      };
    case "CLEAR_ATTACHMENTS":
      return {
        ...state,
        addAttachment: initialState.commonInternal.addAttachment,
        fileUrl: initialState.commonInternal.fileUrl,
      };
    case "UPDATE_FILE_ATTACHMENTS_ERROR":
      return {
        ...state,
        errors: {
          addAttachment: action.payload.errors.addAttachment,
        },
      };
    case "UPDATE_ROLE_MATCHES":
      return {
        ...state,
        matches: action.payload.matches,
      };
    case "UPDATE_ROLE_HIGHLIGHTED_INDEX":
      return {
        ...state,
        highlightedIndex: action.payload.highlightedIndex
      };
    case "UPDATE_ROLE_HIGHLIGHTED_INDEX_UP":
      return {
        ...state,
        highlightedIndex:
          state.highlightedIndex > 0
            ? state.highlightedIndex - 1
            : action.payload.matchesLength - 1,
      };
    case "UPDATE_ROLE_HIGHLIGHTED_INDEX_DOWN":
      return {
        ...state,
        highlightedIndex:
          state.highlightedIndex <
            action.payload.matchesLength - 1
            ? state.highlightedIndex + 1 : 0
      };
    case "UPDATE_ROLE_SEARCH_TERM":
      return {
        ...state,
        roleSearchTerm: action.payload.roleSearchTerm,
      };
    case "SET_CURRENT_PAGE":
      return {
        ...state,
        currentPage: action.payload.value,
      };
    case "SET_ROWS_PER_PAGE":
      return {
        ...state,
        rowsPerPage: action.payload.value,
      };
    case "SET_TOTAL_PAGES":
      return {
        ...state,
        totalPages: action.payload.value,
      };
    case "GO_TO_FIRST_PAGE":
      return { ...state, currentPage: 1 }; // Page 1 is the first page
    case "GO_TO_LAST_PAGE":
      return { ...state, currentPage: action.payload.totalPages }; // Last page
    case "GO_TO_NEXT_PAGE":
      return {
        ...state,
        currentPage: Math.min(state.currentPage + 1, action.payload.totalPages),
      };
    case "GO_TO_PREVIOUS_PAGE":
      return { ...state, currentPage: Math.max(state.currentPage - 1, 1) };
    case 'UPDATE_TABLE_SEARCH':
      return { ...state, search: { ...state.search, ...action.payload } };
    case 'UPDATE_ORDER_BY':
      return { ...state, orderBy: action.payload.orderBy };
    case 'UPDATE_ORDER_DIRECTION':
      return { ...state, orderDirection: action.payload.orderDirection };
    default:
      return state;
  }
};
