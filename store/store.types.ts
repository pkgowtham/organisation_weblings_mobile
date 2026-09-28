export interface Store {
  gender: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  state: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  country: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  city: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  sector: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  natureOfBusiness: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  typeOfBusiness: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  currency: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  billingType: {
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    dataGetList: any;
    errorGetList: string | null;
  };
  commonInternal: {
    addAttachment: any[];
    fileUrl: string[];
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    isCollapsed: boolean;
    isCalenderOpen: boolean;
    matches: any;
    highlightedIndex: number;
    roleSearchTerm: string;
    loading: boolean;
    errors: {
      addAttachment?: string;
    };
    search: {
      searchTerm?: string;
    };
    light: boolean;
    orderBy: string;
    orderDirection: string;
  };
  orgAdminModal: {
    adminModalOpen: boolean;
    adminTab: "org" | "domain" | "plan" | "success";
    orgTab: "info" | "location" | "finance";
    domainTab: "begin" | "select" | "existing" | "new";
    domainSelectTab: "free" | "existing" | "new";
    existingTab: "dummy" | "search" | "success";
    newTab: "terms" | "search" | "confirm";
    planTab: "detail" | "review" | "dns" | "payment" | "failed";
    isLoadingCreateOrg: boolean;
    isSuccessCreateOrg: boolean;
    isErrorCreateOrg: boolean;
    errorCreateOrg?: string | null;
  };
  auth: {
    /** Transient email carried through the signup/login flow */
    email: string;
    /** Transient userId carried through verification steps */
    userId: string;
    orgAuthId: string | null;
    /** In-memory mirror of secureStorage authToken */
    authToken: string | null;

    // Check Email
    isLoadingCheckEmail: boolean;
    isSuccessCheckEmail: boolean;
    isErrorCheckEmail: boolean;
    errorCheckEmail: string | null;

    // Signup
    isLoadingSignup: boolean;
    isSuccessSignup: boolean;
    isErrorSignup: boolean;
    errorSignup: string | null;

    // Verify Email
    isLoadingVerifyEmail: boolean;
    isSuccessVerifyEmail: boolean;
    isErrorVerifyEmail: boolean;

    // Send Mobile OTP
    isLoadingMobileOtp: boolean;
    isSuccessMobileOtp: boolean;
    isErrorMobileOtp: boolean;

    // Verify Mobile OTP
    isLoadingVerifyMobile: boolean;
    isSuccessVerifyMobile: boolean;
    isErrorVerifyMobile: boolean;

    // Update MFA
    isLoadingUpdateMfa: boolean;
    isSuccessUpdateMfa: boolean;
    isErrorUpdateMfa: boolean;

    // Login
    isLoadingLogin: boolean;
    isSuccessLogin: boolean;
    isErrorLogin: boolean;
    errorLogin: string | null;

    // Verify Login OTP
    isLoadingVerifyLoginOtp: boolean;
    isSuccessVerifyLoginOtp: boolean;
    isErrorVerifyLoginOtp: boolean;

    // Forgot Password
    isLoadingForgotPassword: boolean;
    isSuccessForgotPassword: boolean;
    isErrorForgotPassword: boolean;
    errorForgotPassword: string | null;

    // Verify Forgot Password OTP
    isLoadingVerifyForgotPasswordOtp: boolean;
    isSuccessVerifyForgotPasswordOtp: boolean;
    isErrorVerifyForgotPasswordOtp: boolean;

    // Reset Password
    isLoadingResetPassword: boolean;
    isSuccessResetPassword: boolean;
    isErrorResetPassword: boolean;
    errorResetPassword: string | null;

    // Resend OTP
    isLoadingResendOtp: boolean;
    isSuccessResendOtp: boolean;
    isErrorResendOtp: boolean;

    // Verify MFA OTP
    isLoadingVerifyMfaOtp: boolean;
    isSuccessVerifyMfaOtp: boolean;
    isErrorVerifyMfaOtp: boolean;
  };
  profile: {
    profileData: any | null;
    isLoadingGetProfile: boolean;
    isSuccessGetProfile: boolean;
    isErrorGetProfile: boolean;
    errorGetProfile: string | null;
    isLoadingUpdateProfile: boolean;
    isSuccessUpdateProfile: boolean;
    isErrorUpdateProfile: boolean;
    errorUpdateProfile: string | null;
    isLoadingUploadDp: boolean;
    isSuccessUploadDp: boolean;
    isErrorUploadDp: boolean;
    uploadedDpData: any | null;
  };
  organisationBasic: {
    organisationBasicData: any | null;
    isLoadingGetOrgBasic: boolean;
    isSuccessGetOrgBasic: boolean;
    isErrorGetOrgBasic: boolean;
    errorGetOrgBasic: string | null;
    isLoadingCreateOrgBasic: boolean;
    isSuccessCreateOrgBasic: boolean;
    isErrorCreateOrgBasic: boolean;
    errorCreateOrgBasic: string | null;
    isLoadingUpdateOrgBasic: boolean;
    isSuccessUpdateOrgBasic: boolean;
    isErrorUpdateOrgBasic: boolean;
    errorUpdateOrgBasic: string | null;
  };
  businessUnit: {
    businessUnitList: any[];
    selectedBusinessUnit: any | null;
    totalElements: number;
    totalPages: number;
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    isLoadingDetail: boolean;
    isSuccessDetail: boolean;
    isErrorDetail: boolean;
    isLoadingCreate: boolean;
    isSuccessCreate: boolean;
    isErrorCreate: boolean;
  };
  businessUnitLocation: {
    businessUnitLocationList: any[];
    selectedBusinessUnitLocation: any | null;
    totalElements: number;
    totalPages: number;
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    isLoadingCreate: boolean;
    isSuccessCreate: boolean;
    isErrorCreate: boolean;
    isLoadingResetPassword: boolean;
    isSuccessResetPassword: boolean;
    isErrorResetPassword: boolean;
  };
  plan: {
    plansData: any[];
    isLoadingGetPlans: boolean;
    isSuccessGetPlans: boolean;
    isErrorGetPlans: boolean;
    errorGetPlans: string | null;
  };
  client: {
    clientList: any[];
    selectedClient: any | null;
    totalElements: number;
    totalPages: number;
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    isLoadingCreate: boolean;
    isSuccessCreate: boolean;
    isErrorCreate: boolean;
    isLoadingUpdate: boolean;
    isSuccessUpdate: boolean;
    isErrorUpdate: boolean;
    isLoadingDelete: boolean;
    isSuccessDelete: boolean;
    isErrorDelete: boolean;
  };
  project: {
    projectList: any[];
    selectedProject: any | null;
    totalElements: number;
    totalPages: number;
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    isLoadingCreate: boolean;
    isSuccessCreate: boolean;
    isErrorCreate: boolean;
    isLoadingUpdate: boolean;
    isSuccessUpdate: boolean;
    isErrorUpdate: boolean;
    isLoadingDelete: boolean;
    isSuccessDelete: boolean;
    isErrorDelete: boolean;
  };
  team: {
    teamList: any[];
    selectedTeam: any | null;
    totalElements: number;
    totalPages: number;
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
    isLoadingCreate: boolean;
    isSuccessCreate: boolean;
    isErrorCreate: boolean;
    isLoadingUpdate: boolean;
    isSuccessUpdate: boolean;
    isErrorUpdate: boolean;
    isLoadingDelete: boolean;
    isSuccessDelete: boolean;
    isErrorDelete: boolean;
  };
  employee: {
    employeeList: any[];
    isLoadingGetList: boolean;
    isSuccessGetList: boolean;
    isErrorGetList: boolean;
  };
  organisationDashboard: {
    isLoadingStats: boolean;
    isSuccessStats: boolean;
    isErrorStats: boolean;
    statsData: {
      orgId?: string;
      bulId?: string;
      totalProjects?: number;
      clients?: number;
      totalEmployees?: number;
      totalTeams?: number;
      pendingTimesheets?: number;
    } | null;
    errorStats: string | null;
    isLoadingProjectsOverview: boolean;
    isSuccessProjectsOverview: boolean;
    isErrorProjectsOverview: boolean;
    projectsOverviewData: {
      project?: {
        id: string;
        projectName: string;
        status: string;
      };
      totalTasks?: number;
      statuses?: Array<{
        id: string;
        name: string;
        colorCode: string;
        order: string | number;
        taskCount: number;
      }>;
    } | null;
    errorProjectsOverview: string | null;
    isLoadingEmployeeOverview: boolean;
    isSuccessEmployeeOverview: boolean;
    isErrorEmployeeOverview: boolean;
    employeeOverviewData: {
      bulId?: string;
      totalEmployees?: number;
      departments?: Array<{
        id: string;
        name: string;
        employeeCount: number;
        percentage?: number;
      }>;
    } | null;
    errorEmployeeOverview: string | null;
    isLoadingTopClients: boolean;
    isSuccessTopClients: boolean;
    isErrorTopClients: boolean;
    topClientsData: {
      bulId?: string;
      clients?: Array<{
        id: string;
        clientName: string;
        clientCode?: string;
        projectsCount?: number;
        email?: string;
        phone?: string;
        createdAt?: string;
      }>;
    } | null;
    errorTopClients: string | null;
    isLoadingProjectHealth: boolean;
    isSuccessProjectHealth: boolean;
    isErrorProjectHealth: boolean;
    projectHealthData: {
      bulId?: string;
      projects?: Array<{
        id: string;
        projectName: string;
        status?: string;
        createdAt?: string;
        durationMonths?: number;
        targetEndDate?: string;
        progress?: number;
        health?: string;
        healthColor?: string;
        totalTasks?: number;
        completedTasks?: number;
      }>;
    } | null;
    errorProjectHealth: string | null;
    isLoadingClientActivities: boolean;
    isSuccessClientActivities: boolean;
    isErrorClientActivities: boolean;
    clientActivitiesData: {
      bulId?: string;
      activities?: Array<{
        id: string;
        name?: string;
        description?: string;
        client?: {
          id: string;
          clientName: string;
        } | null;
        project?: {
          id: string;
          projectName: string;
        } | null;
        user?: {
          id: string;
          displayName: string;
          dP?: string;
        } | null;
        createdAt?: string;
        formattedDate?: string;
      }>;
    } | null;
    errorClientActivities: string | null;
  };
  support: {
    supportTypes: any[];
    relatedModules: any[];
    isLoadingSupportTypes: boolean;
    isSuccessSupportTypes: boolean;
    isErrorSupportTypes: boolean;
    isLoadingRelatedModule: boolean;
    isSuccessRelatedModule: boolean;
    isErrorRelatedModule: boolean;
    isLoadingCreate: boolean;
    isSuccessCreate: boolean;
    isErrorCreate: boolean;
  };
}
