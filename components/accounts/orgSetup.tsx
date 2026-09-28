import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/CustomThemeContext";
import { useStore } from "@/store";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useToast } from "@/context/ToastContext";
import { getItemAsync, setItemAsync } from "@/utils/secureStorage";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";

import { BusinessUnitListView } from "./orgSetup/BusinessUnitListView";
import { AddBusinessUnitView, BUFormData } from "./orgSetup/AddBusinessUnitView";
import { LocationListView } from "./orgSetup/LocationListView";
import { AddLocationView, LocFormData } from "./orgSetup/AddLocationView";
import { ResetPasswordView } from "./orgSetup/ResetPasswordView";
import { CredentialsModal } from "./orgSetup/CredentialsModal";

const PAGE_SIZE = 10;

export type ViewState =
  | "unit_list"
  | "add_unit"
  | "location_list"
  | "add_location"
  | "reset_password";

const BU_REQUIRED: (keyof BUFormData)[] = [
  "name",
  "description",
  "countryId",
  "stateId",
  "cityId",
  "addressLine1",
  "zipcode",
  "subDomain",
];

const LOC_REQUIRED: (keyof LocFormData)[] = [
  "name",
  "description",
  "countryId",
  "stateId",
  "cityId",
  "addressLine1",
  "zipcode",
  "subDomain",
  "employeePrefix",
];

interface OrgSetupProps {
  initialView?: ViewState;
  isOnboarding?: boolean;
}

export default function OrgSetup({
  initialView = "unit_list",
  isOnboarding = false,
}: OrgSetupProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { safeReplace } = useSafeNavigation();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { showToast } = useToast();

  const [view, setView] = useState<ViewState>(initialView);
  const [orgAuthId, setOrgAuthId] = useState<string>("");

  // BU / Location list pagination
  const [buPage, setBuPage] = useState(0);
  const [locPage, setLocPage] = useState(0);

  // Dropdown pagination
  const [countryPage, setCountryPage] = useState(1);
  const [countryTotalPages, setCountryTotalPages] = useState(1);
  const [statePage, setStatePage] = useState(1);
  const [stateTotalPages, setStateTotalPages] = useState(1);
  const [cityPage, setCityPage] = useState(1);
  const [cityTotalPages, setCityTotalPages] = useState(1);

  const [isLoadingMoreCountry, setIsLoadingMoreCountry] = useState(false);
  const [isLoadingMoreState, setIsLoadingMoreState] = useState(false);
  const [isLoadingMoreCity, setIsLoadingMoreCity] = useState(false);

  const [accumulatedCountries, setAccumulatedCountries] = useState<any[]>([]);
  const [accumulatedStates, setAccumulatedStates] = useState<any[]>([]);
  const [accumulatedCities, setAccumulatedCities] = useState<any[]>([]);

  const mergeItems = (prev: any[], newItems: any[]) => {
    const map = new Map();
    prev.forEach((item) => {
      const key = item.id || item.value || item.code;
      if (key) map.set(key, item);
    });
    newItems.forEach((item) => {
      const key = item.id || item.value || item.code;
      if (key) map.set(key, item);
    });
    return Array.from(map.values());
  };

  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  // Redux state
  const {
    businessUnitList,
    isLoadingGetList: isLoadingBUs,
    totalPages: buTotalPages,
    isLoadingCreate: isLoadingCreateBU,
  } = store.businessUnit;

  const {
    businessUnitLocationList,
    isLoadingGetList: isLoadingLocs,
    totalPages: locTotalPages,
    isLoadingCreate: isLoadingCreateLoc,
    isLoadingResetPassword,
  } = store.businessUnitLocation;

  // Add Business Unit Form state
  const [buFormData, setBuFormData] = useState<BUFormData>({
    name: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    countryId: "",
    stateId: "",
    cityId: "",
    zipcode: "",
    subDomain: "",
  });
  const [buErrors, setBuErrors] = useState<Partial<Record<keyof BUFormData, string>>>({});

  // Add Location Form state
  const [locFormData, setLocFormData] = useState<LocFormData>({
    name: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    countryId: "",
    stateId: "",
    cityId: "",
    zipcode: "",
    subDomain: "",
    employeePrefix: "",
  });
  const [locErrors, setLocErrors] = useState<Partial<Record<keyof LocFormData, string>>>({});

  // Credentials Modal state
  const [showCredModal, setShowCredModal] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);

  const getResolvedOrgId = async (): Promise<string> => {
    let id =
      orgAuthId ||
      store.auth.orgAuthId ||
      (await getItemAsync("orgAuthId")) ||
      store.organisationBasic.organisationBasicData?.id ||
      store.organisationBasic.organisationBasicData?.orgId ||
      store.profile.profileData?.orgAuthId ||
      store.profile.profileData?.orgId ||
      "";

    if (!id) {
      const res: any = await dispatch({
        type: "GET_ORG_BASIC_API_REQUEST",
        payload: { url: "organisationBasic", method: "GET" },
      });
      const data = res?.data || res;
      id = Array.isArray(data) ? data[0]?.id : data?.id || "";
      if (id) {
        setOrgAuthId(id);
        await setItemAsync("orgAuthId", id);
        (dispatch as any)({ type: "SET_AUTH_ORG_AUTH_ID", payload: { orgAuthId: id } });
      }
    }
    return id;
  };

  // 1. Resolve OrgAuthId & Initial Business Units List
  useEffect(() => {
    (async () => {
      const id = await getResolvedOrgId();
      setOrgAuthId(id);
      if (id) {
        dispatch({
          type: "BU_GETLIST_API_REQUEST",
          payload: {
            url: "businessUnit",
            method: "GET",
            query: { orgId: id, page: buPage, size: PAGE_SIZE },
          },
        });
      }
    })();
  }, [buPage, dispatch]);

  // 2. Fetch Locations when locPage or selectedUnit changes in location_list view
  useEffect(() => {
    if (view === "location_list" && selectedUnit?.id) {
      dispatch({
        type: "BUL_GETLIST_API_REQUEST",
        payload: {
          url: "businessUnitLocation",
          method: "GET",
          query: { buId: selectedUnit.id, page: locPage, size: PAGE_SIZE },
        },
      });
    }
  }, [view, selectedUnit, locPage, dispatch]);

  // Sync store → accumulated lists
  useEffect(() => {
    const raw = store.country.dataGetList?.data || store.country.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedCountries((prev) => mergeItems(prev, raw));
  }, [store.country.dataGetList]);

  useEffect(() => {
    const raw = store.state.dataGetList?.data || store.state.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedStates((prev) => mergeItems(prev, raw));
  }, [store.state.dataGetList]);

  useEffect(() => {
    const raw = store.city.dataGetList?.data || store.city.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedCities((prev) => mergeItems(prev, raw));
  }, [store.city.dataGetList]);

  // 3. Fetch Countries on Mount for Form Views
  useEffect(() => {
    if (view === "add_unit" || view === "add_location") {
      (async () => {
        const res: any = await dispatch({
          type: "COUNTRY_GETLIST_API_REQUEST",
          payload: { url: "country", method: "GET", query: { page: 1, limit: 20 } },
        });
        if (res?.meta?.totalPages !== undefined) setCountryTotalPages(res.meta.totalPages);
      })();
    }
  }, [view, dispatch]);

  // 4. Fetch States when Country changes
  const activeCountry = view === "add_unit" ? buFormData.countryId : locFormData.countryId;
  useEffect(() => {
    if (activeCountry) {
      setAccumulatedStates([]);
      setStatePage(1);
      setStateTotalPages(1);
      setAccumulatedCities([]);
      setCityPage(1);
      setCityTotalPages(1);
      (async () => {
        const res: any = await dispatch({
          type: "STATE_GETLIST_API_REQUEST",
          payload: { url: `state`, method: "GET", query: { countryId: activeCountry, page: 1, limit: 20 } },
        });
        if (res?.meta?.totalPages !== undefined) setStateTotalPages(res.meta.totalPages);
      })();
    }
  }, [activeCountry, dispatch]);

  // 5. Fetch Cities when State changes
  const activeState = view === "add_unit" ? buFormData.stateId : locFormData.stateId;
  useEffect(() => {
    if (activeState) {
      setAccumulatedCities([]);
      setCityPage(1);
      setCityTotalPages(1);
      (async () => {
        const res: any = await dispatch({
          type: "CITY_GETLIST_API_REQUEST",
          payload: { url: `city?stateId=${activeState}`, method: "GET", query: { page: 1, limit: 20 } },
        });
        if (res?.meta?.totalPages !== undefined) setCityTotalPages(res.meta.totalPages);
      })();
    }
  }, [activeState, dispatch]);

  // Load-more handlers for dropdown pagination
  const handleLoadMoreCountry = async () => {
    if (isLoadingMoreCountry || countryPage >= countryTotalPages) return;
    setIsLoadingMoreCountry(true);
    const nextPage = countryPage + 1;
    const res: any = await dispatch({
      type: "COUNTRY_GETLIST_API_REQUEST",
      payload: { url: "country", method: "GET", query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreCountry(false);
    if (res?.meta?.totalPages !== undefined) setCountryTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setCountryPage(nextPage);
  };

  const handleLoadMoreState = async () => {
    if (isLoadingMoreState || !activeCountry || statePage >= stateTotalPages) return;
    setIsLoadingMoreState(true);
    const nextPage = statePage + 1;
    const res: any = await dispatch({
      type: "STATE_GETLIST_API_REQUEST",
      payload: { url: `state`, method: "GET", query: { countryId: activeCountry, page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreState(false);
    if (res?.meta?.totalPages !== undefined) setStateTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setStatePage(nextPage);
  };

  const handleLoadMoreCity = async () => {
    if (isLoadingMoreCity || !activeState || cityPage >= cityTotalPages) return;
    setIsLoadingMoreCity(true);
    const nextPage = cityPage + 1;
    const res: any = await dispatch({
      type: "CITY_GETLIST_API_REQUEST",
      payload: { url: `city?stateId=${activeState}`, method: "GET", query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreCity(false);
    if (res?.meta?.totalPages !== undefined) setCityTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setCityPage(nextPage);
  };

  // Derive dropdown options from accumulated lists
  const rawCountry = accumulatedCountries.length > 0 ? accumulatedCountries : (store.country.dataGetList?.data || store.country.dataGetList || []);
  const countryOptions = Array.isArray(rawCountry)
    ? rawCountry.map((item: any) => ({
        value: item.id,
        label: item.countryName || item.name || item.label || item.id,
      }))
    : [];

  const rawState = accumulatedStates.length > 0 ? accumulatedStates : (store.state.dataGetList?.data || store.state.dataGetList || []);
  const stateOptions = Array.isArray(rawState)
    ? rawState.map((item: any) => ({
        value: item.id,
        label: item.label || item.stateName || item.name || item.id,
      }))
    : [];

  const rawCity = accumulatedCities.length > 0 ? accumulatedCities : (store.city.dataGetList?.data || store.city.dataGetList || []);
  const cityOptions = Array.isArray(rawCity)
    ? rawCity.map((item: any) => ({
        value: item.id,
        label: item.label || item.cityName || item.name || item.id,
      }))
    : [];

  // Handlers
  const fetchLocationsForUnit = (unit: any) => {
    setSelectedUnit(unit);
    setLocPage(0);
    dispatch({
      type: "BU_DETAIL_API_REQUEST",
      payload: { url: `businessUnit/${unit.id}`, method: "GET" },
    });
    dispatch({
      type: "BUL_GETLIST_API_REQUEST",
      payload: {
        url: "businessUnitLocation",
        method: "GET",
        query: { buId: unit.id, page: 0, size: PAGE_SIZE },
      },
    });
    setView("location_list");
  };

  const validateBU = (): boolean => {
    const errs: Partial<Record<keyof BUFormData, string>> = {};
    BU_REQUIRED.forEach((field) => {
      if (!buFormData[field]?.toString().trim()) {
        errs[field] = `${field.replace(/([A-Z])/g, " $1").trim()} is required`;
      }
    });
    if (buFormData.zipcode && isNaN(Number(buFormData.zipcode))) {
      errs.zipcode = "Zipcode must be a valid number";
    }
    setBuErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isBuFormValid = BU_REQUIRED.every((f) => buFormData[f]?.toString().trim());

  const handleCreateUnit = async () => {
    if (!validateBU() || isLoadingCreateBU) return;

    const targetOrgId = await getResolvedOrgId();
    if (!targetOrgId) {
      showToast({ type: "error", iconType: "error", title: "Organisation ID not found. Please reload." });
      return;
    }

    const payload = {
      name: buFormData.name.trim(),
      description: buFormData.description.trim(),
      orgId: targetOrgId,
      countryId: buFormData.countryId,
      stateId: buFormData.stateId,
      cityId: buFormData.cityId,
      addressLine1: buFormData.addressLine1.trim(),
      addressLine2: buFormData.addressLine2.trim(),
      zipcode: Number(buFormData.zipcode.trim()),
      subDomain: buFormData.subDomain.trim(),
    };

    try {
      const res: any = await dispatch({
        type: "BU_CREATE_API_REQUEST",
        payload: { url: "businessUnit", method: "POST", body: payload },
      });

      if (res && res.success !== false) {
        showToast({ type: "success", iconType: "success", title: res?.message || "Business Unit created successfully" });

        setBuFormData({
          name: "",
          description: "",
          addressLine1: "",
          addressLine2: "",
          countryId: "",
          stateId: "",
          cityId: "",
          zipcode: "",
          subDomain: "",
        });
        setBuErrors({});
        setBuPage(0);
        dispatch({
          type: "BU_GETLIST_API_REQUEST",
          payload: { url: "businessUnit", method: "GET", query: { orgId: targetOrgId, page: 0, size: PAGE_SIZE } },
        });

        // Go back to the Business Unit list view
        setView("unit_list");
      } else {
        showToast({ type: "error", iconType: "error", title: res?.message || "Failed to create Business Unit" });
      }
    } catch (err: any) {
      showToast({ type: "error", iconType: "error", title: err?.message || "Failed to create Business Unit" });
    }
  };

  const validateLoc = (): boolean => {
    const errs: Partial<Record<keyof LocFormData, string>> = {};
    LOC_REQUIRED.forEach((field) => {
      if (!locFormData[field]?.toString().trim()) {
        errs[field] = `${field.replace(/([A-Z])/g, " $1").trim()} is required`;
      }
    });
    if (locFormData.zipcode && isNaN(Number(locFormData.zipcode))) {
      errs.zipcode = "Zipcode must be a valid number";
    }
    setLocErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isLocFormValid = LOC_REQUIRED.every((f) => locFormData[f]?.toString().trim());

  const handleCreateLocation = async () => {
    if (!validateLoc() || !selectedUnit || isLoadingCreateLoc) return;

    const targetOrgId = await getResolvedOrgId();
    if (!targetOrgId) {
      showToast({ type: "error", iconType: "error", title: "Organisation ID not found. Please reload." });
      return;
    }

    const payload = {
      name: locFormData.name.trim(),
      description: locFormData.description.trim(),
      orgId: targetOrgId,
      buId: selectedUnit.id,
      countryId: locFormData.countryId,
      stateId: locFormData.stateId,
      cityId: locFormData.cityId,
      addressLine1: locFormData.addressLine1.trim(),
      addressLine2: locFormData.addressLine2.trim(),
      zipcode: Number(locFormData.zipcode.trim()),
      subDomain: locFormData.subDomain.trim(),
      employeePrefix: locFormData.employeePrefix.trim(),
    };

    try {
      const response: any = await dispatch({
        type: "BUL_CREATE_API_REQUEST",
        payload: { url: "businessUnitLocation", method: "POST", body: payload },
      });

      if (response && response.success !== false) {
        const resData = response.data || response;
        const email =
          resData.adminEmail ||
          resData.userName ||
          resData.username ||
          `${locFormData.employeePrefix.toLowerCase()}@${locFormData.subDomain}.com`;
        const password =
          resData.password ||
          resData.tempPassword ||
          resData.generatedPassword ||
          "TempPass@123";

        const bulId = resData.id || resData.bulId || resData._id || "";
        if (bulId) {
          await setItemAsync("bulId", bulId);
          (dispatch as any)({
            type: "SET_SELECTED_BUL",
            payload: resData,
          });
        }

        setCreatedCreds({ email, password });
        setShowCredModal(true);

        setLocFormData({
          name: "",
          description: "",
          addressLine1: "",
          addressLine2: "",
          countryId: "",
          stateId: "",
          cityId: "",
          zipcode: "",
          subDomain: "",
          employeePrefix: "",
        });
        setLocErrors({});
      } else {
        showToast({ type: "error", iconType: "error", title: response?.message || "Failed to create location" });
      }
    } catch (err: any) {
      showToast({ type: "error", iconType: "error", title: err?.message || "Failed to create location" });
    }
  };

  const handleOpenResetPassword = (loc: any) => {
    setSelectedLocation(loc);
    setView("reset_password");
  };

  const handleConfirmResetPassword = async (passwords: { newPassword: string; confirmPassword: string }) => {
    const response = await dispatch({
      type: "BUL_RESET_PASSWORD_API_REQUEST",
      payload: {
        url: "businessUnitLocation/resetPassword",
        method: "POST",
        body: {
          locationId: selectedLocation?.id,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        },
      },
    });

    if (response || store.businessUnitLocation.isSuccessResetPassword) {
      showToast({ type: "success", iconType: "success", title: "Location password reset successfully" });
      setView("location_list");
    } else {
      showToast({ type: "error", iconType: "error", title: "Failed to reset password" });
    }
  };

  return (
    <View style={styles.container}>
      {view === "unit_list" && (
        <BusinessUnitListView
          businessUnitList={businessUnitList}
          isLoadingBUs={isLoadingBUs}
          buPage={buPage}
          buTotalPages={buTotalPages}
          onPageChange={setBuPage}
          onSelectUnit={fetchLocationsForUnit}
          onCreateUnitPress={() => setView("add_unit")}
          onCreateLocationForUnit={(bu) => {
            setSelectedUnit(bu);
            setView("add_location");
          }}
          paddingBottom={insets.bottom + 40}
        />
      )}

      {view === "add_unit" && (
        <AddBusinessUnitView
          formData={buFormData}
          errors={buErrors}
          countryOptions={countryOptions}
          stateOptions={stateOptions}
          cityOptions={cityOptions}
          isLoadingCreate={isLoadingCreateBU}
          isValid={isBuFormValid}
          onFieldChange={(field, val) => {
            setBuFormData((prev) => ({ ...prev, [field]: val }));
            if (buErrors[field]) setBuErrors((prev) => ({ ...prev, [field]: "" }));
          }}
          onSubmit={handleCreateUnit}
          onCancel={() => {
            if (isOnboarding) {
              safeReplace("/(protected)/(tabs)");
            } else {
              setView("unit_list");
            }
          }}
          onEndReachedCountry={handleLoadMoreCountry}
          onEndReachedState={handleLoadMoreState}
          onEndReachedCity={handleLoadMoreCity}
          paddingBottom={insets.bottom + 40}
        />
      )}

      {view === "location_list" && (
        <LocationListView
          businessUnitName={selectedUnit?.name || "Business Unit"}
          locationList={businessUnitLocationList}
          isLoadingLocs={isLoadingLocs}
          locPage={locPage}
          locTotalPages={locTotalPages}
          onPageChange={setLocPage}
          onCreateLocationPress={() => setView("add_location")}
          onResetPasswordPress={handleOpenResetPassword}
          onBack={() => setView("unit_list")}
          paddingBottom={insets.bottom + 40}
        />
      )}

      {view === "add_location" && (
        <AddLocationView
          businessUnitName={selectedUnit?.name || "Business Unit"}
          formData={locFormData}
          errors={locErrors}
          countryOptions={countryOptions}
          stateOptions={stateOptions}
          cityOptions={cityOptions}
          isLoadingCreate={isLoadingCreateLoc}
          isValid={isLocFormValid}
          onFieldChange={(field, val) => {
            setLocFormData((prev) => ({ ...prev, [field]: val }));
            if (locErrors[field]) setLocErrors((prev) => ({ ...prev, [field]: "" }));
          }}
          onSubmit={handleCreateLocation}
          onBack={() => {
            if (isOnboarding) {
              setView("add_unit");
            } else {
              setView("location_list");
            }
          }}
          onClose={() => {
            if (isOnboarding) {
              safeReplace("/(protected)/(tabs)");
            } else {
              setView("location_list");
            }
          }}
          onEndReachedCountry={handleLoadMoreCountry}
          onEndReachedState={handleLoadMoreState}
          onEndReachedCity={handleLoadMoreCity}
          paddingBottom={insets.bottom + 40}
        />
      )}


      {view === "reset_password" && (
        <ResetPasswordView
          businessUnitName={selectedUnit?.name || "Business Unit"}
          isLoadingReset={isLoadingResetPassword}
          onConfirm={handleConfirmResetPassword}
          onBack={() => setView("location_list")}
          paddingBottom={insets.bottom + 40}
        />
      )}

      <CredentialsModal
        visible={showCredModal}
        creds={createdCreds}
        isOnboarding={isOnboarding}
        onClose={() => {
          setShowCredModal(false);
          if (isOnboarding) {
            safeReplace("/(protected)/(tabs)");
          } else {
            setView("location_list");
          }
        }}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
  });
