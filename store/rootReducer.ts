import { commonInternalReducer } from "@/services/commons";
import { stateReducer } from "@/services/commons/state";
import { genderReducer } from "@/services/commons/gender";
import { countryReducer } from "@/services/commons/country";
import { cityReducer } from "@/services/commons/city";
import { sectorReducer } from "@/services/commons/sector";
import { natureOfBusinessReducer } from "@/services/commons/natureOfBusiness";
import { typeOfBusinessReducer } from "@/services/commons/typeOfBusiness";
import { currencyReducer } from "@/services/commons/currency";
import { billingTypeReducer } from "@/services/commons/billingType";
import { orgAdminModalReducer } from "@/services/orgAdminModal";
import { authReducer } from "@/services/auth";
import { profileReducer } from "@/services/profile";
import { organisationBasicReducer } from "@/services/organisationBasic";
import { planReducer } from "@/services/plan";
import { businessUnitReducer } from "@/services/businessUnit";
import { businessUnitLocationReducer } from "@/services/businessUnitLocation";
import { clientReducer } from "@/services/client";
import { projectReducer } from "@/services/project";
import { teamReducer } from "@/services/team";
import { employeeReducer } from "@/services/employee";
import { organisationDashboardReducer } from "@/services/organisationDashboard";
import { supportReducer } from "@/services/support";
import type { ActionType } from "./action.types";
import type { Store } from "./store.types";

export const combineReducers = (reducers: {
  [key: string]: (state: any, action: ActionType) => any;
}) => {
  return (state: Store, action: ActionType): Store => {
    const newState: Store = {} as Store;

    for (const key in reducers) {
      newState[key as keyof Store] = reducers[key](
        state ? state[key as keyof Store] : undefined,
        action
      );
    }

    return newState;
  };
};

import { initialState } from "./initialState";

const appCombinedReducer = combineReducers({
  gender: genderReducer,
  state: stateReducer,
  country: countryReducer,
  city: cityReducer,
  sector: sectorReducer,
  natureOfBusiness: natureOfBusinessReducer,
  typeOfBusiness: typeOfBusinessReducer,
  currency: currencyReducer,
  billingType: billingTypeReducer,
  commonInternal: commonInternalReducer,
  orgAdminModal: orgAdminModalReducer,
  auth: authReducer,
  profile: profileReducer,
  organisationBasic: organisationBasicReducer,
  businessUnit: businessUnitReducer,
  businessUnitLocation: businessUnitLocationReducer,
  plan: planReducer,
  client: clientReducer,
  project: projectReducer,
  team: teamReducer,
  employee: employeeReducer,
  organisationDashboard: organisationDashboardReducer,
  support: supportReducer,
});

export const rootReducer = (state: Store = initialState, action: ActionType): Store => {
  if (action.type === "LOGOUT_CLEAR_REDUX_STORE" || action.type === "RESET_STORE") {
    return initialState;
  }
  return appCombinedReducer(state, action);
};

