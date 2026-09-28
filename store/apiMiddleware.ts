import { useStore } from "./index";
import { apiFetch } from "./apiInstance";
import { ActionType } from "./action.types";

export function* apiMiddleware(action: ActionType): Generator<any, void, any> {
  if (action.type.endsWith("_API_REQUEST")) {
   
    yield {
      type: action.type.replace("_REQUEST", "_LOADING"),
      updatedData: (action as any).updatedData,
    };
    try { 
      const data = yield apiFetch((action as any).payload);
      yield {
        type: action.type.replace("_REQUEST", "_SUCCESS"),
        payload: data,
        updatedData: (action as any).updatedData,
      };
      if (action.clear) {
        yield { type: action.type.replace("_REQUEST", "_CLEAR") };
      }
    } catch (error: any) {
      yield {
        type: action.type.replace("_REQUEST", "_FAILURE"),
        error: error,
        updatedData: (action as any).updatedData,
      };

      if (action.clear) {
        yield { type: action.type.replace("_REQUEST", "_CLEAR") };
      }
    }
  }
}

import { useCallback } from "react";

export const useMiddlewareDispatch = () => {
  const { dispatch } = useStore();

  return useCallback(
    async (action: ActionType) => {
      if (action.type.endsWith("_API_REQUEST")) {
        const generator = apiMiddleware(action);

        let next = generator.next();
        let responseData: any = undefined;

        try {
          while (!next.done) {
            const yieldedValue = next.value;

            if (yieldedValue instanceof Promise) {
              try {
                const resolvedValue = await yieldedValue;
                responseData = resolvedValue;
                next = generator.next(resolvedValue);
              } catch (error: any) {
                next = generator.throw(error);
              }
            } else {
              dispatch(yieldedValue);
              next = generator.next();
            }
          }
        } catch (error: any) {
          return undefined;
        }

        return responseData;
      } else {
        dispatch(action);
        if (action.clear) {
          dispatch({ type: `${action.type}_CLEAR` });
        }
      }
    },
    [dispatch]
  );
};

