import type { ActionType } from "@/store/action.types";
import { initialState } from "@/store/initialState";
import type { Store } from "@/store/store.types";

export const organisationDashboardReducer = (
  state: Store["organisationDashboard"] = initialState.organisationDashboard,
  action: ActionType
): Store["organisationDashboard"] => {
  switch (action.type) {
    // ── Dashboard Stats ───────────────────────────────────────────────────────
    case "ORGANISATION_DASHBOARD_STATS_API_LOADING":
      return {
        ...state,
        isLoadingStats: true,
        isSuccessStats: false,
        isErrorStats: false,
      };

    case "ORGANISATION_DASHBOARD_STATS_API_SUCCESS":
      return {
        ...state,
        isLoadingStats: false,
        isSuccessStats: true,
        isErrorStats: false,
        statsData:
          (action as any).payload?.data || (action as any).payload || null,
        errorStats: null,
      };

    case "ORGANISATION_DASHBOARD_STATS_API_FAILURE":
      return {
        ...state,
        isLoadingStats: false,
        isSuccessStats: false,
        isErrorStats: true,
        errorStats:
          (action as any).error || "Failed to fetch dashboard stats",
      };

    case "ORGANISATION_DASHBOARD_STATS_API_CLEAR":
      return {
        ...state,
        isLoadingStats: false,
        isSuccessStats: false,
        isErrorStats: false,
        statsData: null,
      };

    // ── Projects Overview ──────────────────────────────────────────────────────
    case "ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_LOADING":
      return {
        ...state,
        isLoadingProjectsOverview: true,
        isSuccessProjectsOverview: false,
        isErrorProjectsOverview: false,
      };

    case "ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_SUCCESS":
      return {
        ...state,
        isLoadingProjectsOverview: false,
        isSuccessProjectsOverview: true,
        isErrorProjectsOverview: false,
        projectsOverviewData:
          (action as any).payload?.data || (action as any).payload || null,
        errorProjectsOverview: null,
      };

    case "ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_FAILURE":
      return {
        ...state,
        isLoadingProjectsOverview: false,
        isSuccessProjectsOverview: false,
        isErrorProjectsOverview: true,
        errorProjectsOverview:
          (action as any).error || "Failed to fetch projects overview",
      };

    case "ORGANISATION_DASHBOARD_PROJECTS_OVERVIEW_API_CLEAR":
      return {
        ...state,
        isLoadingProjectsOverview: false,
        isSuccessProjectsOverview: false,
        isErrorProjectsOverview: false,
        projectsOverviewData: null,
      };

    // ── Employee Overview ──────────────────────────────────────────────────────
    case "ORGANISATION_DASHBOARD_EMPLOYEE_OVERVIEW_API_LOADING":
      return {
        ...state,
        isLoadingEmployeeOverview: true,
        isSuccessEmployeeOverview: false,
        isErrorEmployeeOverview: false,
      };

    case "ORGANISATION_DASHBOARD_EMPLOYEE_OVERVIEW_API_SUCCESS":
      return {
        ...state,
        isLoadingEmployeeOverview: false,
        isSuccessEmployeeOverview: true,
        isErrorEmployeeOverview: false,
        employeeOverviewData:
          (action as any).payload?.data || (action as any).payload || null,
        errorEmployeeOverview: null,
      };

    case "ORGANISATION_DASHBOARD_EMPLOYEE_OVERVIEW_API_FAILURE":
      return {
        ...state,
        isLoadingEmployeeOverview: false,
        isSuccessEmployeeOverview: false,
        isErrorEmployeeOverview: true,
        errorEmployeeOverview:
          (action as any).error || "Failed to fetch employee overview",
      };

    case "ORGANISATION_DASHBOARD_EMPLOYEE_OVERVIEW_API_CLEAR":
      return {
        ...state,
        isLoadingEmployeeOverview: false,
        isSuccessEmployeeOverview: false,
        isErrorEmployeeOverview: false,
        employeeOverviewData: null,
      };

    // ── Top Clients ───────────────────────────────────────────────────────────
    case "ORGANISATION_DASHBOARD_TOP_CLIENTS_API_LOADING":
      return {
        ...state,
        isLoadingTopClients: true,
        isSuccessTopClients: false,
        isErrorTopClients: false,
      };

    case "ORGANISATION_DASHBOARD_TOP_CLIENTS_API_SUCCESS":
      return {
        ...state,
        isLoadingTopClients: false,
        isSuccessTopClients: true,
        isErrorTopClients: false,
        topClientsData:
          (action as any).payload?.data || (action as any).payload || null,
        errorTopClients: null,
      };

    case "ORGANISATION_DASHBOARD_TOP_CLIENTS_API_FAILURE":
      return {
        ...state,
        isLoadingTopClients: false,
        isSuccessTopClients: false,
        isErrorTopClients: true,
        errorTopClients:
          (action as any).error || "Failed to fetch top clients",
      };

    case "ORGANISATION_DASHBOARD_TOP_CLIENTS_API_CLEAR":
      return {
        ...state,
        isLoadingTopClients: false,
        isSuccessTopClients: false,
        isErrorTopClients: false,
        topClientsData: null,
      };

    // ── Project Health ────────────────────────────────────────────────────────
    case "ORGANISATION_DASHBOARD_PROJECT_HEALTH_API_LOADING":
      return {
        ...state,
        isLoadingProjectHealth: true,
        isSuccessProjectHealth: false,
        isErrorProjectHealth: false,
      };

    case "ORGANISATION_DASHBOARD_PROJECT_HEALTH_API_SUCCESS":
      return {
        ...state,
        isLoadingProjectHealth: false,
        isSuccessProjectHealth: true,
        isErrorProjectHealth: false,
        projectHealthData:
          (action as any).payload?.data || (action as any).payload || null,
        errorProjectHealth: null,
      };

    case "ORGANISATION_DASHBOARD_PROJECT_HEALTH_API_FAILURE":
      return {
        ...state,
        isLoadingProjectHealth: false,
        isSuccessProjectHealth: false,
        isErrorProjectHealth: true,
        errorProjectHealth:
          (action as any).error || "Failed to fetch project health",
      };

    case "ORGANISATION_DASHBOARD_PROJECT_HEALTH_API_CLEAR":
      return {
        ...state,
        isLoadingProjectHealth: false,
        isSuccessProjectHealth: false,
        isErrorProjectHealth: false,
        projectHealthData: null,
      };

    // ── Client Activities ─────────────────────────────────────────────────────
    case "ORGANISATION_DASHBOARD_CLIENT_ACTIVITIES_API_LOADING":
      return {
        ...state,
        isLoadingClientActivities: true,
        isSuccessClientActivities: false,
        isErrorClientActivities: false,
      };

    case "ORGANISATION_DASHBOARD_CLIENT_ACTIVITIES_API_SUCCESS":
      return {
        ...state,
        isLoadingClientActivities: false,
        isSuccessClientActivities: true,
        isErrorClientActivities: false,
        clientActivitiesData:
          (action as any).payload?.data || (action as any).payload || null,
        errorClientActivities: null,
      };

    case "ORGANISATION_DASHBOARD_CLIENT_ACTIVITIES_API_FAILURE":
      return {
        ...state,
        isLoadingClientActivities: false,
        isSuccessClientActivities: false,
        isErrorClientActivities: true,
        errorClientActivities:
          (action as any).error || "Failed to fetch client activities",
      };

    case "ORGANISATION_DASHBOARD_CLIENT_ACTIVITIES_API_CLEAR":
      return {
        ...state,
        isLoadingClientActivities: false,
        isSuccessClientActivities: false,
        isErrorClientActivities: false,
        clientActivitiesData: null,
      };

    default:
      return state;
  }
};
