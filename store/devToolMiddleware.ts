import { useReducer, Reducer, useRef, useEffect, useCallback } from "react";

export function useReducerWithDevTools<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  name: string = "React Context Store",
) {
  const devTools =
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__;

  const [state, originalDispatch] = useReducer(reducer, initialState);

  const devToolsInstanceRef = useRef(
    devTools ? devTools.connect({ name }) : null,
  );

  const devToolsInstance = devToolsInstanceRef.current;

  // Latest state reference to ensure accurate state is sent to DevTools
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initialize Redux DevTools and set up a subscription
  useEffect(() => {
    if (devToolsInstance) {
      devToolsInstance.init(initialState);

      // Subscribe to DevTools messages
      const unsubscribe = devToolsInstance.subscribe((message: any) => {
        if (message.type === "DISPATCH" && message.payload) {
          const { type } = message.payload;

          if (type === "JUMP_TO_ACTION" || type === "JUMP_TO_STATE") {
            const newState = JSON.parse(message.state);
            // Replace the state with the jumped-to state
            originalDispatch({ type: "__SET_STATE__", payload: newState } as A);
          }
        }
      });

      return () => {
        unsubscribe?.(); // Clean up the subscription on unmount
        // devToolsInstance.disconnect();
      };
    }
  }, [devToolsInstance, initialState]);

  // Enhanced dispatch function
  const enhancedDispatch = useCallback((action: A) => {
    // Apply action to get the next state
    const newState = reducer(stateRef.current, action);

    // Update state reference
    stateRef.current = newState;

    // Send updated state to Redux DevTools
    devToolsInstance?.send(action, newState);

    // Dispatch the action to update state
    originalDispatch(action);
  }, [reducer, devToolsInstance, originalDispatch]);

  return [state, enhancedDispatch] as const;
}
