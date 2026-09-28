import type { ActionType } from "@/store/action.types";

export interface ListState<T = any> {
  isLoadingGetList: boolean;
  isSuccessGetList: boolean;
  isErrorGetList: boolean;
  dataGetList: T | null;
  errorGetList: any | null;
}

export const initialListState: ListState = {
  isLoadingGetList: false,
  isSuccessGetList: false,
  isErrorGetList: false,
  dataGetList: null,
  errorGetList: null,
};

/**
 * Generic Higher-Order Reducer Factory for Master / Lookup entity list fetching.
 * Reduces 10 duplicated commons reducers to a single reusable factory adhering to OCP.
 */
export function createListReducer<T = any>(actionPrefix: string, initialDefaultState: ListState<T> = initialListState) {
  const loadingType = `${actionPrefix}_GETLIST_API_LOADING`;
  const successType = `${actionPrefix}_GETLIST_API_SUCCESS`;
  const failureType = `${actionPrefix}_GETLIST_API_FAILURE`;
  const clearType = `${actionPrefix}_GETLIST_API_CLEAR`;

  return (
    state: ListState<T> = initialDefaultState,
    action: ActionType
  ): ListState<T> => {
    switch (action.type) {
      case loadingType:
        return { ...state, isLoadingGetList: true, isSuccessGetList: false, isErrorGetList: false, dataGetList: null, errorGetList: null };
      case successType:
        return { ...state, isLoadingGetList: false, isSuccessGetList: true, isErrorGetList: false, dataGetList: (action as any).payload, errorGetList: null };
      case failureType:
        return { ...state, isLoadingGetList: false, isSuccessGetList: false, isErrorGetList: true, dataGetList: null, errorGetList: (action as any).error };
      case clearType:
        return { ...initialDefaultState };
      default:
        return state;
    }
  };
}
