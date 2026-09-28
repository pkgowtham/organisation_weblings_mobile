import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/CustomThemeContext";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { Typography } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import Svg, { Path } from "react-native-svg";

import EOfficeTopBar from "@/components/ui/eOfficeTopBar";
import { useDrawer } from "@/context/DrawerContext";
import DashboardContent from "@/components/dashboard/dashboardContent";

import ScrollTabs from "@/components/ui/scrollTabs";
import ClientsList from "@/components/clients/clientsList";
import ProjectsList from "@/components/projects/projectsList";
import EmployeeDetailsList from "@/components/employeeDetails/employeeDetailsList";
import TeamsList from "@/components/teams/teamsList";
import { BusinessHubCard } from "@/components/businessHub";

import { useStore } from "@/store";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { getItemAsync } from "@/utils/secureStorage";
import { ArrowBackIos, ChevronDown, Close, CircleCheck } from "@/svg_icons";

const ArrowLeftIcon = ({ color = "#334155", size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ArrowRightIcon = ({ color = "#334155", size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18L15 12L9 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BuildingIcon = ({ color = "#000", size = 56 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
      fill={color}
    />
  </Svg>
);

const DASHBOARD_TABS = [
  "Dashboard",
  "Clients",
  "Projects",
  "Teams",
  "Timesheet approval",
  "Employee Details",
];

const PAGE_SIZE = 12;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safePush } = useSafeNavigation();
  const { openDrawer } = useDrawer();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();

  // Selected Business Unit for Detail View (matching web /orgAdmin/businessHub/:buId)
  const [selectedBuId, setSelectedBuId] = useState<string>("");
  const [selectedBuName, setSelectedBuName] = useState<string>("");

  // Business Unit Location selection & Modal
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Active Tab inside Detail View
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  // Pagination for Business Units List
  const [page, setPage] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const orgData = store.organisationBasic?.organisationBasicData;
  const isLoadingOrg = store.organisationBasic?.isLoadingGetOrgBasic;
  const isErrorOrg = store.organisationBasic?.isErrorGetOrgBasic;

  const rawBuList = store.businessUnit?.businessUnitList;
  const buList = Array.isArray(rawBuList) ? rawBuList : [];
  const isLoadingBuList = store.businessUnit?.isLoadingGetList;
  const totalPages = store.businessUnit?.totalPages || 1;

  const rawLocList = store.businessUnitLocation?.businessUnitLocationList;
  const locList = Array.isArray(rawLocList) ? rawLocList : [];

  // 1. Fetch Organization Basic Details & Business Units List on Mount or Page Change
  const fetchBusinessUnits = useCallback(
    async (targetPage = 0) => {
      const orgAuthId =
        store.auth.orgAuthId ||
        (await getItemAsync("orgAuthId")) ||
        "";
      if (orgAuthId) {
        dispatch({
          type: "GET_ORG_BASIC_API_REQUEST",
          payload: { url: `/organisationBasic/${orgAuthId}`, method: "GET" },
        });
        dispatch({
          type: "BU_GETLIST_API_REQUEST",
          payload: {
            url: "/businessUnit",
            method: "GET",
            query: { orgId: orgAuthId, page: targetPage, size: PAGE_SIZE },
          },
        });
      }
    },
    [dispatch, store.auth.orgAuthId]
  );

  useEffect(() => {
    fetchBusinessUnits(page);
  }, [fetchBusinessUnits, page]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBusinessUnits(page);
    setIsRefreshing(false);
  };

  // 2. Select a Business Unit from the List -> Switch to Detail View (exact web behavior)
  const handleSelectBu = (bu: any) => {
    const id = bu.id || bu._id || "";
    const name = bu.name || "Business Unit";
    setSelectedBuId(id);
    setSelectedBuName(name);
    setSelectedLocationId("");

    dispatch({
      type: "SET_SELECTED_BU",
      payload: bu,
    });
    dispatch({
      type: "BU_DETAIL_API_REQUEST",
      payload: { url: `/businessUnit/${id}`, method: "GET" },
    });
    dispatch({
      type: "BUL_GETLIST_API_REQUEST",
      payload: {
        url: "/businessUnitLocation",
        method: "GET",
        query: { buId: id, page: 0, size: 50 },
      },
    });
  };

  // 3. Return to Business Units List (initial screen)
  const handleBackToBuList = () => {
    setSelectedBuId("");
    setSelectedBuName("");
    setSelectedLocationId("");
    setActiveTab("Dashboard");
  };

  // 4. Auto-select first Business Unit Location when locations arrive for the selected BU
  useEffect(() => {
    if (selectedBuId && Array.isArray(locList) && locList.length > 0) {
      const isCurrentValid = locList.some(
        (l: any) => (l.id || l._id) === selectedLocationId
      );
      if (!selectedLocationId || !isCurrentValid) {
        const firstLoc = locList[0];
        const firstLocId = firstLoc.id || firstLoc._id || "";
        setSelectedLocationId(firstLocId);
        dispatch({
          type: "SET_SELECTED_BUL",
          payload: firstLoc,
        });
      }
    } else if (selectedBuId && Array.isArray(locList) && locList.length === 0) {
      setSelectedLocationId("");
    }
  }, [locList, selectedBuId, selectedLocationId, dispatch]);

  const handleSelectLocation = (loc: any) => {
    const targetId = loc.id || loc._id || "";
    setSelectedLocationId(targetId);
    dispatch({
      type: "SET_SELECTED_BUL",
      payload: loc,
    });
    setIsLocationModalOpen(false);
  };

  // Find currently selected location object and display label
  const selectedLocationObj = locList.find(
    (l: any) => (l.id || l._id) === selectedLocationId
  );
  const selectedLocationName =
    selectedLocationObj?.name ||
    selectedLocationObj?.locationName ||
    selectedLocationObj?.city?.cityName ||
    selectedLocationObj?.addressLine1 ||
    (locList.length > 0 ? "Select Location" : "No locations available");

  // Derive setup completion flags
  const hasBasicInfo = Boolean(
    orgData && (orgData.id || orgData.orgName) && !isErrorOrg
  );
  const hasBusinessUnits = buList.length > 0;

  const handleStartSetup = () => {
    safePush("/(protected)/(organisation)/setup");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: DETAIL VIEW (When a Business Unit has been selected)
  // ─────────────────────────────────────────────────────────────────────────────
  if (selectedBuId) {
    return (
      <SafeAreaView edges={["top"]} style={styles.screen}>
        {/* TopBar with Back Button to return to Business Units initial screen */}
        <EOfficeTopBar
          heading="Business Hub"
          menuIcon={
            <ArrowBackIos
              width={20}
              height={20}
              color={theme.colors.neutral.surface.inverse}
            />
          }
          onMenuPress={handleBackToBuList}
        />

        {/* Detail Header: Business Unit Name (Bold Plain Text) & Business Location Dropdown (Pure API Data) */}
        <View style={styles.detailHeaderBar}>
          <View style={styles.buNameWrapper}>
            <Typography
              fontVariant="BL"
              variant="bold"
              color="colors.neutral.onSurface.light"
              numberOfLines={1}
            >
              {selectedBuName || "Business Unit"}
            </Typography>
          </View>

          {/* Location Dropdown Trigger */}
          <TouchableOpacity
            style={styles.locationDropdownTrigger}
            onPress={() => setIsLocationModalOpen(true)}
            activeOpacity={0.7}
          >
            <Typography
              fontVariant="BS"
              variant="medium"
              color="colors.neutral.onSurface.dark"
              numberOfLines={1}
              style={{ maxWidth: 160 }}
            >
              {selectedLocationName}
            </Typography>
            <ChevronDown
              width={16}
              height={16}
              color={theme.colors.neutral.onSurface.dark}
            />
          </TouchableOpacity>
        </View>

        {/* Scrollable Tabs */}
        <View style={styles.tabsHeader}>
          <ScrollTabs
            tabs={DASHBOARD_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "Dashboard" ? (
            <DashboardContent
              bulId={selectedLocationId}
              buId={selectedBuId}
              onSelectTab={setActiveTab}
            />
          ) : activeTab === "Clients" ? (
            <ClientsList
              buId={selectedBuId}
              locationId={selectedLocationId}
              bulId={selectedLocationId}
            />
          ) : activeTab === "Projects" ? (
            <ProjectsList
              buId={selectedBuId}
              locationId={selectedLocationId}
              bulId={selectedLocationId}
            />
          ) : activeTab === "Teams" ? (
            <TeamsList
              buId={selectedBuId}
              locationId={selectedLocationId}
              bulId={selectedLocationId}
            />
          ) : activeTab === "Employee Details" ? (
            <EmployeeDetailsList
              buId={selectedBuId}
              locationId={selectedLocationId}
              bulId={selectedLocationId}
            />
          ) : (
            <View style={styles.centerContainer}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.dark">
                {activeTab} content under development...
              </Typography>
            </View>
          )}
        </View>

        {/* Location Picker Modal */}
        <Modal
          visible={isLocationModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsLocationModalOpen(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsLocationModalOpen(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark">
                  Select Business Location
                </Typography>
                <TouchableOpacity
                  onPress={() => setIsLocationModalOpen(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Close width={20} height={20} color={theme.colors.neutral.onSurface.dark} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                {locList.length === 0 ? (
                  <View style={{ paddingVertical: 20, alignItems: "center" }}>
                    <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
                      No locations available for this Business Unit.
                    </Typography>
                  </View>
                ) : (
                  locList.map((loc: any) => {
                    const locId = loc.id || loc._id || "";
                    const isSelected = locId === selectedLocationId;
                    const locTitle =
                      loc.name ||
                      loc.locationName ||
                      loc.city?.cityName ||
                      loc.addressLine1 ||
                      "Location";

                    return (
                      <TouchableOpacity
                        key={locId}
                        style={[
                          styles.locationItemRow,
                          isSelected && styles.locationItemRowActive,
                        ]}
                        onPress={() => handleSelectLocation(loc)}
                      >
                        <View style={{ flex: 1 }}>
                          <Typography
                            fontVariant="BS"
                            variant={isSelected ? "bold" : "regular"}
                            color={
                              isSelected
                                ? "colors.brand.onSurface.light"
                                : "colors.neutral.onSurface.dark"
                            }
                          >
                            {locTitle}
                          </Typography>
                          {loc.addressLine1 && (
                            <Typography
                              fontVariant="LS"
                              color="colors.neutral.onSurface.medium"
                              style={{ marginTop: 2 }}
                            >
                              {loc.addressLine1}
                              {loc.city?.cityName ? `, ${loc.city.cityName}` : ""}
                            </Typography>
                          )}
                        </View>
                        {isSelected && (
                          <CircleCheck
                            width={18}
                            height={18}
                            color={theme.colors.brand.surface.medium || "#0072C4"}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: INITIAL SCREEN (Business Units Cards List - Exactly like web app)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <EOfficeTopBar
        heading="Business Hub"
        onMenuPress={() => openDrawer("accounts")}
      />

      {isLoadingOrg && !orgData ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
          <Typography
            fontVariant="BS"
            color="colors.neutral.onSurface.dark"
            style={{ marginTop: theme.spacing.s300 }}
          >
            Loading organization details...
          </Typography>
        </View>
      ) : !hasBasicInfo ? (
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
              onPress={handleStartSetup}
            />
          </View>
        </View>
      ) : !hasBusinessUnits && !isLoadingBuList ? (
        <View style={styles.centerContainer}>
          <View style={styles.setupCard}>
            <BuildingIcon color={theme.colors.neutral.onSurface.light} size={56} />
            <Typography
              fontVariant="BM"
              variant="bold"
              color="colors.neutral.onSurface.light"
              style={styles.setupTitle}
            >
              Setup Business Unit
            </Typography>
            <Typography
              fontVariant="BS"
              color="colors.neutral.onSurface.dark"
              style={styles.setupSubtitle}
            >
              Create your business unit and location to get started
            </Typography>
            <CustomButton
              title="Create"
              variant="primary"
              size="small"
              onPress={() =>
                safePush("/(protected)/(organisation)/orgSetup", {
                  initialView: "add_unit",
                  isOnboarding: "true",
                })
              }
            />
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.pageContainer}
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.brand.surface.medium}
            />
          }
        >
          {/* Page Title: "Business Units" (Matching Web App) */}
          <Typography
            fontVariant="TM"
            variant="bold"
            color="colors.neutral.onSurface.dark"
            style={styles.pageTitle}
          >
            Business Units
          </Typography>

          {/* Loading Indicator */}
          {isLoadingBuList && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.brand.surface.medium} />
              <Typography
                fontVariant="BS"
                color="colors.neutral.onSurface.medium"
                style={{ marginLeft: 8 }}
              >
                Loading business units...
              </Typography>
            </View>
          )}

          {/* Business Units Cards Grid / List (Using BusinessHubCard) */}
          {!isLoadingBuList && buList.length > 0 && (
            <View style={styles.cardsList}>
              {buList.map((bu: any) => (
                <BusinessHubCard
                  key={bu.id || bu._id}
                  bu={bu}
                  onPress={() => handleSelectBu(bu)}
                />
              ))}
            </View>
          )}

          {/* No Data Empty State (Matching Web App) */}
          {!isLoadingBuList && buList.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Typography
                fontVariant="TM"
                variant="bold"
                color="colors.neutral.onSurface.dark"
                style={styles.emptyStateTitle}
              >
                No data available
              </Typography>
              <Typography
                fontVariant="BS"
                color="colors.neutral.onSurface.medium"
                style={styles.emptyStateSubtitle}
              >
                No Business Units found in Business Hub.
              </Typography>
            </View>
          )}

          {/* Pagination Controls (Matching Web App) */}
          {totalPages > 1 && buList.length > 0 && (
            <View style={styles.paginationRow}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
                disabled={page === 0}
                onPress={() => setPage((p) => Math.max(0, p - 1))}
                activeOpacity={0.7}
              >
                <ArrowLeftIcon
                  color={page === 0 ? "#94A3B8" : "#334155"}
                  size={16}
                />
              </TouchableOpacity>

              {Array.from({ length: totalPages }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.pageBtn,
                    i === page && {
                      backgroundColor:
                        theme.colors.brand.surface.medium || "#0072C4",
                      borderColor:
                        theme.colors.brand.surface.medium || "#0072C4",
                    },
                  ]}
                  onPress={() => setPage(i)}
                  activeOpacity={0.7}
                >
                  <Typography
                    fontVariant="BS"
                    variant={i === page ? "bold" : "regular"}
                    style={{
                      color:
                        i === page
                          ? "#FFFFFF"
                          : theme.colors.neutral.onSurface.dark,
                    }}
                  >
                    {i + 1}
                  </Typography>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  page >= totalPages - 1 && styles.pageBtnDisabled,
                ]}
                disabled={page >= totalPages - 1}
                onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                activeOpacity={0.7}
              >
                <ArrowRightIcon
                  color={page >= totalPages - 1 ? "#94A3B8" : "#334155"}
                  size={16}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    pageContainer: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    pageContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#0F172A",
      marginBottom: 16,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    cardsList: {
      gap: 14,
    },
    // ── Empty State ──────────────────────────────────────────────────────────
    emptyStateContainer: {
      minHeight: 260,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      gap: 8,
      marginTop: 12,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#0F172A",
    },
    emptyStateSubtitle: {
      textAlign: "center",
      maxWidth: 300,
    },
    // ── Pagination Row ───────────────────────────────────────────────────────
    paginationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 24,
      paddingVertical: 8,
    },
    pageBtn: {
      minWidth: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 8,
    },
    pageBtnDisabled: {
      opacity: 0.35,
    },
    // ── Detail View Styles ───────────────────────────────────────────────────
    detailHeaderBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "#FFFFFF",
      gap: 12,
    },
    buNameWrapper: {
      flex: 1,
    },
    locationDropdownTrigger: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      backgroundColor: "#FFFFFF",
    },
    tabsHeader: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      paddingHorizontal: 8,
      zIndex: 1,
    },
    tabContent: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
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
    // ── Modal Styles ─────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
      marginBottom: 12,
    },
    locationItemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 6,
    },
    locationItemRowActive: {
      backgroundColor: "#F0F9FF",
    },
  });
