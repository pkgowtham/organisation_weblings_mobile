
import React, { createContext, useContext, ReactNode } from 'react';
import { rootReducer } from './rootReducer';
import { Store } from './store.types';
import { initialState } from './initialState';
import { ActionType } from './action.types';
import { useReducerWithDevTools } from "./devToolMiddleware"


interface StoreContextType {
  store: Store;
  dispatch: React.Dispatch<ActionType>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, dispatch] = useReducerWithDevTools(rootReducer, initialState, 'Weblings Store');

  // if (process.env.NODE_ENV !== 'production' || true) {
  //   // @ts-ignore: React Context DevTool global object
  //   window.__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK__?.register?.({
  //     id: 'Webling Store',
  //     displayName: 'Webling Store',
  //     value: { store, dispatch },
  //   });
  // }

  return (
    <StoreContext.Provider value={{ store, dispatch }} >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider scope');
  }
  return context;
};
