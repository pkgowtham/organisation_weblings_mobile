import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "@/components/ui/typography";
import SectionCard from "@/components/ui/sectionCard";
import Input from "@/components/ui/textInput";
import CustomButton from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import DatePicker from "@/components/ui/datePicker";
import { format, isValid } from "date-fns";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "@/store";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useToast } from "@/context/ToastContext";
import { getItemAsync, setItemAsync } from "@/utils/secureStorage";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import Svg, { Path } from "react-native-svg";

const BuildingIcon = ({ color = "#000", size = 56 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
      fill={color}
    />
  </Svg>
);

interface InfoRowProps {
  label: string;
  value: string;
  theme: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, theme }) => {
  const styles = createInfoRowStyles(theme);
  return (
    <View style={styles.row}>
      <Typography
        fontVariant="BS"
        color="colors.neutral.onSurface.dark"
        style={styles.label}
      >
        {label}
      </Typography>
      <Typography
        fontVariant="BS"
        variant="medium"
        color="colors.neutral.onSurface.light"
        style={styles.value}
      >
        {value || "—"}
      </Typography>
    </View>
  );
};

const createInfoRowStyles = (theme: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      paddingVertical: theme.spacing.s200,
    },
    label: {
      flex: 1,
      minWidth: 120,
    },
    value: {
      flex: 1.5,
    },
  });

// ── Value Formatting Helpers matching webcode ─────────────────────────────
const getText = (val: any): string => {
  if (!val) return "-";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  return (
    val.name ||
    val.label ||
    val.countryName ||
    val.stateName ||
    val.cityName ||
    val.currencyName ||
    val.natureOfBusiness ||
    val.typeOfBusiness ||
    val.sectorName ||
    val.id ||
    "-"
  );
};

const formatValue = (val: any): string => {
  const text = getText(val);
  if (!text || text === "-") return "-";
  if (/^[A-Z0-9_]+$/.test(text) && text.includes("_")) {
    return text
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return text;
};

const camelCaseToReadable = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
};

export default function OrgDetails() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const { safePush } = useSafeNavigation();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [orgAuthId, setOrgAuthId] = useState<string>("");

  const orgData = store.organisationBasic.organisationBasicData;
  const isLoading = store.organisationBasic.isLoadingGetOrgBasic;
  const isLoadingSave = store.organisationBasic.isLoadingUpdateOrgBasic;

  // Form State
  const [formData, setFormData] = useState({
    orgName: "",
    orgEntity: "",
    identificationNumber: "",
    dateOfIncorporation: "",
    sectorId: "",
    natureOfBusinessId: "",
    typeOfBusinessId: "",
    country: "",
    stateId: "",
    cityId: "",
    zipcode: "",
    addressLine1: "",
    addressLine2: "",
    currencyId: "",
    financialYear: "",
    employeePrefix: "EMP",
  });

  // Helper to resolve orgAuthId from multiple fallback sources
  const resolveOrgAuthId = useCallback(async () => {
    let id = store.auth.orgAuthId || (await getItemAsync("orgAuthId")) || "";
    if (!id && store.profile.profileData) {
      const p = store.profile.profileData;
      id =
        p.orgAuthId ||
        p.orgAuth ||
        p.orgId ||
        p.organisationId ||
        p.organizationId ||
        p.org?.id ||
        p.organisation?.id ||
        "";
      if (id) {
        await setItemAsync("orgAuthId", id);
        (dispatch as any)({ type: "SET_AUTH_ORG_AUTH_ID", payload: { orgAuthId: id } });
      }
    }
    if (!id) {
      const userId = store.auth.userId || (await getItemAsync("authUserId")) || "";
      if (userId) {
        const res: any = await dispatch({
          type: "GET_PROFILE_API_REQUEST",
          payload: { url: `/orguser/getProfile?id=${userId}`, method: "GET" },
        });
        const p = res?.data || res;
        id =
          p?.orgAuthId ||
          p?.orgAuth ||
          p?.orgId ||
          p?.organisationId ||
          p?.organizationId ||
          p?.org?.id ||
          p?.organisation?.id ||
          "";
        if (id) {
          await setItemAsync("orgAuthId", id);
          (dispatch as any)({ type: "SET_AUTH_ORG_AUTH_ID", payload: { orgAuthId: id } });
        }
      }
    }
    return id;
  }, [store.auth.orgAuthId, store.auth.userId, store.profile.profileData, dispatch]);

  // 1. Fetch Organisation Details from API & Dropdown Lists
  useEffect(() => {
    (async () => {
      const id = await resolveOrgAuthId();
      setOrgAuthId(id);
      if (id) {
        dispatch({
          type: "GET_ORG_BASIC_API_REQUEST",
          payload: { url: `/organisationBasic/${id}`, method: "GET" },
        });
      }
      // Dispatch static dropdown lists so options are available for View and Edit
      dispatch({ type: "SECTOR_GETLIST_API_REQUEST", payload: { url: "/sector", method: "GET" } });
      dispatch({ type: "NATURE_GETLIST_API_REQUEST", payload: { url: "/natureOfBusiness", method: "GET" } });
      dispatch({ type: "TYPE_GETLIST_API_REQUEST", payload: { url: "/typeOfBusiness", method: "GET" } });
      dispatch({ type: "COUNTRY_GETLIST_API_REQUEST", payload: { url: "/country", method: "GET" } });
      dispatch({ type: "CURRENCY_GETLIST_API_REQUEST", payload: { url: "/currency", method: "GET" } });
    })();
  }, [
    resolveOrgAuthId,
    dispatch,
    store.auth.orgAuthId,
    store.organisationBasic.isSuccessCreateOrgBasic,
    store.organisationBasic.isSuccessUpdateOrgBasic,
  ]);

  // 2. Pre-populate Form Data from fetched orgData
  useEffect(() => {
    if (orgData) {
      setFormData({
        orgName: orgData.orgName || "",
        orgEntity: orgData.orgEntity || "",
        identificationNumber: orgData.identificationNumber || "",
        dateOfIncorporation: orgData.dateOfIncorporation
          ? String(orgData.dateOfIncorporation).split("T")[0]
          : "",
        sectorId: orgData.sectorId?.id || orgData.sectorId || "",
        natureOfBusinessId: orgData.natureOfBusinessId?.id || orgData.natureOfBusinessId || "",
        typeOfBusinessId: orgData.typeOfBusinessId?.id || orgData.typeOfBusinessId || "",
        country: orgData.country?.id || orgData.country || "",
        stateId: orgData.stateId?.id || orgData.stateId || "",
        cityId: orgData.cityId?.id || orgData.cityId || "",
        zipcode: orgData.zipcode ? String(orgData.zipcode) : "",
        addressLine1: orgData.addressLine1 || "",
        addressLine2: orgData.addressLine2 || "",
        currencyId: orgData.currency?.id || orgData.currencyId || "",
        financialYear: orgData.financialYear || "",
        employeePrefix: orgData.employeePrefix || "EMP",
      });
    }
  }, [orgData]);

  // Convert string dateOfIncorporation to Date object for DatePicker
  const parsedDateOfIncorporation = useMemo(() => {
    if (!formData.dateOfIncorporation) return undefined;
    const parts = String(formData.dateOfIncorporation).split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isValid(d) ? d : undefined;
    }
    const d = new Date(formData.dateOfIncorporation);
    return isValid(d) ? d : undefined;
  }, [formData.dateOfIncorporation]);

  // 3. Fetch States when Country changes in Edit mode
  useEffect(() => {
    if (formData.country) {
      dispatch({
        type: "STATE_GETLIST_API_REQUEST",
        payload: { url: `/state?countryId=${formData.country}`, method: "GET" },
      });
    }
  }, [formData.country, dispatch]);

  // 4. Fetch Cities when State changes in Edit mode
  useEffect(() => {
    if (formData.stateId) {
      dispatch({
        type: "CITY_GETLIST_API_REQUEST",
        payload: { url: `/city?stateId=${formData.stateId}`, method: "GET" },
      });
    }
  }, [formData.stateId, dispatch]);

  // Derive dropdown options directly from Redux Store
  const rawSector = store.sector.dataGetList?.data || store.sector.dataGetList || [];
  const sectorOptions = Array.isArray(rawSector)
    ? rawSector.map((item: any) => ({
        value: item.id,
        label: item.sectorName || item.name || item.displayName || item.title || item.id,
      }))
    : [];

  const rawNature = store.natureOfBusiness.dataGetList?.data || store.natureOfBusiness.dataGetList || [];
  const natureOptions = Array.isArray(rawNature)
    ? rawNature.map((item: any) => ({
        value: item.id,
        label:
          item.natureOfBusiness ||
          item.natureOfBusinessName ||
          item.nature ||
          item.name ||
          item.displayName ||
          item.title ||
          item.label ||
          item.id,
      }))
    : [];

  const rawType = store.typeOfBusiness.dataGetList?.data || store.typeOfBusiness.dataGetList || [];
  const typeOptions = Array.isArray(rawType)
    ? rawType.map((item: any) => ({
        value: item.id,
        label:
          item.typeOfBusiness ||
          item.typeOfBusinessName ||
          item.type ||
          item.name ||
          item.displayName ||
          item.title ||
          item.label ||
          item.id,
      }))
    : [];

  const rawCountry = store.country.dataGetList?.data || store.country.dataGetList || [];
  const countryOptions = Array.isArray(rawCountry)
    ? rawCountry.map((item: any) => ({
        value: item.value || item.id,
        label: item.label || item.name || item.countryName || item.displayName || item.id,
      }))
    : [];

  const rawState = store.state.dataGetList?.data || store.state.dataGetList || [];
  const stateOptions = Array.isArray(rawState)
    ? rawState.map((item: any) => ({
        value: item.value || item.id,
        label: item.label || item.name || item.stateName || item.displayName || item.id,
      }))
    : [];

  const rawCity = store.city.dataGetList?.data || store.city.dataGetList || [];
  const cityOptions = Array.isArray(rawCity)
    ? rawCity.map((item: any) => ({
        value: item.value || item.id,
        label: item.label || item.name || item.cityName || item.displayName || item.id,
      }))
    : [];

  const rawCurrency = store.currency.dataGetList?.data || store.currency.dataGetList || [];
  const currencyOptions = Array.isArray(rawCurrency)
    ? rawCurrency.map((item: any) => ({
        value: item.id,
        label: item.currencyName
          ? `${item.currencyName} (${item.currencyCode || ""})`
          : item.name
          ? `${item.name} (${item.code || ""})`
          : item.code || item.currencyCode || item.id,
      }))
    : [];

  const getOptionLabel = (val: any, options: { value: string; label: string }[] = []) => {
    if (!val) return "-";
    if (typeof val === "object") {
      return (
        val.name ||
        val.label ||
        val.countryName ||
        val.stateName ||
        val.cityName ||
        val.currencyName ||
        val.natureOfBusiness ||
        val.typeOfBusiness ||
        val.sectorName ||
        val.id ||
        "-"
      );
    }
    const str = String(val);
    const found = options.find((opt) => opt.value === str);
    if (found) return found.label;
    return formatValue(str);
  };

  // ── Handle Save Edit via PUT /organisationBasic ──────────────────
  const handleSave = async () => {
    if (isLoadingSave) return;

    const targetId = orgData?.id || orgAuthId;
    const url = targetId ? `/organisationBasic?id=${targetId}` : `/organisationBasic`;

    const payload = {
      orgName: formData.orgName,
      orgEntity: formData.orgEntity,
      identificationNumber: formData.identificationNumber,
      dateOfIncorporation: formData.dateOfIncorporation,
      sectorId: formData.sectorId,
      natureOfBusinessId: formData.natureOfBusinessId,
      typeOfBusinessId: formData.typeOfBusinessId,
      country: formData.country,
      stateId: formData.stateId,
      cityId: formData.cityId,
      zipcode: Number(formData.zipcode) || 600001,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      currencyId: formData.currencyId,
      financialYear: formData.financialYear,
    };

    const res: any = await dispatch({
      type: "UPDATE_ORG_BASIC_API_REQUEST",
      payload: {
        url,
        method: "PUT",
        body: payload,
      },
    });

    if (res || store.organisationBasic.isSuccessUpdateOrgBasic) {
      showToast({
        type: "success",
        iconType: "success",
        title: "Organisation details updated successfully",
      });
      setIsEditing(false);
      if (targetId) {
        dispatch({
          type: "GET_ORG_BASIC_API_REQUEST",
          payload: { url: `/organisationBasic/${targetId}`, method: "GET" },
        });
      }
    } else {
      showToast({
        type: "error",
        iconType: "error",
        title: store.organisationBasic.errorUpdateOrgBasic || "Failed to update organisation details",
      });
    }
  };

  const handleCancel = () => {
    if (orgData) {
      setFormData({
        orgName: orgData.orgName || "",
        orgEntity: orgData.orgEntity || "",
        identificationNumber: orgData.identificationNumber || "",
        dateOfIncorporation: orgData.dateOfIncorporation
          ? String(orgData.dateOfIncorporation).split("T")[0]
          : "",
        sectorId: orgData.sectorId?.id || orgData.sectorId || "",
        natureOfBusinessId: orgData.natureOfBusinessId?.id || orgData.natureOfBusinessId || "",
        typeOfBusinessId: orgData.typeOfBusinessId?.id || orgData.typeOfBusinessId || "",
        country: orgData.country?.id || orgData.country || "",
        stateId: orgData.stateId?.id || orgData.stateId || "",
        cityId: orgData.cityId?.id || orgData.cityId || "",
        zipcode: orgData.zipcode ? String(orgData.zipcode) : "",
        addressLine1: orgData.addressLine1 || "",
        addressLine2: orgData.addressLine2 || "",
        currencyId: orgData.currency?.id || orgData.currencyId || "",
        financialYear: orgData.financialYear || "",
        employeePrefix: orgData.employeePrefix || "EMP",
      });
    }
    setIsEditing(false);
  };

  if (isLoading && !orgData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
        <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ marginTop: 12 }}>
          Loading organization details...
        </Typography>
      </View>
    );
  }

  const hasOrg = Boolean(
    orgData &&
    (orgData.id || orgData.orgName || orgData.legalName) &&
    !store.organisationBasic.isErrorGetOrgBasic
  );

  // If organization is NOT created yet, render the creation setup screen inside /orgAdmin/details
  if (!hasOrg && !isLoading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.setupCard}>
          <BuildingIcon color={theme.colors.neutral.onSurface.light} size={56} />
          <Typography
            fontVariant="BM"
            variant="bold"
            color="colors.neutral.onSurface.light"
            style={styles.setupTitle}
          >
            Setup your organization
          </Typography>
          <Typography
            fontVariant="BS"
            color="colors.neutral.onSurface.dark"
            style={styles.setupSubtitle}
          >
            Enter your organization details to get started
          </Typography>
          <CustomButton
            title="Create"
            variant="primary"
            size="small"
            onPress={() => safePush("/(protected)/(organisation)/setup")}
          />
        </View>
      </View>
    );
  }

  // ── Display Data Model matching webcode ────────────────────────
  const displayData = {
    company: {
      legalName: formatValue(orgData?.orgName),
      legalEntityName: formatValue(orgData?.orgEntity),
      identificationNumber: formatValue(orgData?.identificationNumber),
      dateOfIncorporation: formatValue(
        orgData?.dateOfIncorporation ? String(orgData.dateOfIncorporation).split("T")[0] : "-"
      ),
      sector: getOptionLabel(orgData?.sectorId, sectorOptions),
      natureOfBusiness: getOptionLabel(orgData?.natureOfBusinessId, natureOptions),
      typeOfBusiness: getOptionLabel(orgData?.typeOfBusinessId, typeOptions),
      employeePrefix: formatValue(orgData?.employeePrefix || "EMP"),
    },
    location: {
      country: getOptionLabel(orgData?.country, countryOptions),
      state: getOptionLabel(orgData?.stateId, stateOptions),
      city: getOptionLabel(orgData?.cityId, cityOptions),
      zipCode: formatValue(orgData?.zipcode),
      addressLine1: formatValue(orgData?.addressLine1),
      addressLine2: formatValue(orgData?.addressLine2),
    },
    finance: {
      currency: getOptionLabel(orgData?.currency || orgData?.currencyId, currencyOptions),
      financialYear: formatValue(orgData?.financialYear),
    },
  };

  // ── View Mode ──────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light">
            Organisation Details
          </Typography>
          <CustomButton
            title="Edit"
            variant="primary"
            size="small"
            onPress={() => setIsEditing(true)}
            iconLeft="Edit"
            iconSize={16}
          />
        </View>

        {/* Company Info */}
        <SectionCard title="Company">
          {Object.entries(displayData.company).map(([dataKey, dataValue]) => (
            <InfoRow
              key={dataKey}
              label={camelCaseToReadable(dataKey)}
              value={dataValue}
              theme={theme}
            />
          ))}
        </SectionCard>

        {/* Location */}
        <SectionCard title="Location">
          {Object.entries(displayData.location).map(([dataKey, dataValue]) => (
            <InfoRow
              key={dataKey}
              label={camelCaseToReadable(dataKey)}
              value={dataValue}
              theme={theme}
            />
          ))}
        </SectionCard>

        {/* Finance */}
        <SectionCard title="Finance">
          {Object.entries(displayData.finance).map(([dataKey, dataValue]) => (
            <InfoRow
              key={dataKey}
              label={camelCaseToReadable(dataKey)}
              value={dataValue}
              theme={theme}
            />
          ))}
        </SectionCard>
      </ScrollView>
    );
  }

  // ── Edit Mode ──────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light">
          Edit Organisation Details
        </Typography>
        <View style={styles.headerActions}>
          <CustomButton
            title="Cancel"
            variant="outline"
            size="xs"
            disabled={isLoadingSave}
            onPress={handleCancel}
          />
          <CustomButton
            title="Save"
            variant="primary"
            size="xs"
            loading={isLoadingSave}
            disabled={isLoadingSave}
            onPress={handleSave}
          />
        </View>
      </View>

      {/* Company Info */}
      <SectionCard title="Company">
        <Input
          label="Legal Name"
          value={formData.orgName}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, orgName: v }))}
          placeholder="Legal Name"
        />
        <Input
          label="Legal Entity Name"
          value={formData.orgEntity}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, orgEntity: v }))}
          placeholder="Legal Entity Name"
        />
        <Input
          label="Identification Number"
          value={formData.identificationNumber}
          onChangeText={(v) =>
            setFormData((prev) => ({ ...prev, identificationNumber: v }))
          }
          placeholder="Identification Number"
        />
        <DatePicker
          label="Date of Incorporation"
          placeholder="Select date"
          value={parsedDateOfIncorporation}
          onChange={(date: Date) =>
            setFormData((prev) => ({
              ...prev,
              dateOfIncorporation: format(date, "yyyy-MM-dd"),
            }))
          }
          containerStyle={{ marginBottom: theme.spacing.s600 }}
        />
        <Dropdown
          label="Sector"
          options={sectorOptions}
          selectedValue={formData.sectorId}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, sectorId: v }))}
          placeholder="Select Sector"
        />
        <Dropdown
          label="Nature of Business"
          options={natureOptions}
          selectedValue={formData.natureOfBusinessId}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, natureOfBusinessId: v }))
          }
          placeholder="Select Nature of Business"
        />
        <Dropdown
          label="Type of Business"
          options={typeOptions}
          selectedValue={formData.typeOfBusinessId}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, typeOfBusinessId: v }))
          }
          placeholder="Select Type of Business"
        />
        <Input
          label="Employee Prefix"
          value={formData.employeePrefix}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, employeePrefix: v }))}
          placeholder="e.g. EMP"
        />
      </SectionCard>

      {/* Location */}
      <SectionCard title="Location">
        <Dropdown
          label="Country"
          options={countryOptions}
          selectedValue={formData.country}
          onValueChange={(v) =>
            setFormData((prev) => ({
              ...prev,
              country: v,
              stateId: "",
              cityId: "",
            }))
          }
          placeholder="Select Country"
        />
        <Dropdown
          label="State"
          options={stateOptions}
          selectedValue={formData.stateId}
          onValueChange={(v) =>
            setFormData((prev) => ({
              ...prev,
              stateId: v,
              cityId: "",
            }))
          }
          placeholder="Select State"
        />
        <Dropdown
          label="City"
          options={cityOptions}
          selectedValue={formData.cityId}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, cityId: v }))}
          placeholder="Select City"
        />
        <Input
          label="Zipcode"
          value={formData.zipcode}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, zipcode: v }))}
          placeholder="Zipcode"
          keyboardType="number-pad"
        />
        <Input
          label="Address Line 1"
          value={formData.addressLine1}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, addressLine1: v }))}
          placeholder="Address Line 1"
        />
        <Input
          label="Address Line 2"
          value={formData.addressLine2}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, addressLine2: v }))}
          placeholder="Address Line 2"
        />
      </SectionCard>

      {/* Finance */}
      <SectionCard title="Finance">
        <Dropdown
          label="Currency"
          options={currencyOptions}
          selectedValue={formData.currencyId}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, currencyId: v }))}
          placeholder="Select Currency"
        />
        <Input
          label="Financial Year (e.g. 2025-2026)"
          value={formData.financialYear}
          onChangeText={(v) => setFormData((prev) => ({ ...prev, financialYear: v }))}
          placeholder="e.g. 2025-2026"
        />
      </SectionCard>
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.s300,
    },
    headerActions: {
      flexDirection: "row",
      gap: theme.spacing.s200,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.s500,
      paddingVertical: 32,
    },
    setupCard: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: theme.colors.neutral.surface.light,
      borderColor: theme.colors.neutral.border.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius.b300,
      padding: theme.spacing.s600,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    setupTitle: {
      marginTop: theme.spacing.s400,
      marginBottom: theme.spacing.s100,
    },
    setupSubtitle: {
      textAlign: "center",
      marginBottom: theme.spacing.s500,
    },
  });
