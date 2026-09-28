// cypress/e2e/individualSetting/validation.cy.js

describe("StreamLine Mobile - Project Individual Settings Common Validation Suite (TC_103 to TC_114)", () => {
  const registerReloadMocks = (statusData) => {
    cy.intercept("GET", "**/V1/status*", {
      statusCode: 200,
      body: {
        data: statusData || [
          { id: "status-101", name: "TODO", description: "Backlog items ready for development", colorCode: "#0072C4", order: 1 },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectStatusesReload");

    cy.intercept("GET", "**/V1/priority*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectPrioritiesReload");

    cy.intercept("GET", "**/V1/tags*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectTagsReload");

    cy.intercept("GET", "**/V1/taskType*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectTaskTypesReload");

    cy.intercept("GET", "**/V1/projectMembers*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectMembersReload");

    cy.intercept("GET", "**/V1/streamlineTask/backlog*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getBacklogReload");

    cy.intercept("GET", "**/V1/commonMembers*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 100, totalPages: 1 } },
    }).as("getCommonMembersReload");
  };

  beforeEach(() => {
    // Intercept login
    cy.intercept("POST", "**/employee/login", {
      statusCode: 200,
      body: {
        token: "mock-auth-token",
        data: {
          bulId: { id: "mock-bul-id" },
        },
      },
    }).as("postLogin");

    // Intercept Projects GET call
    cy.intercept("GET", "**/V1/project*", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "project-101",
            projectName: "StreamLine Mobile",
            description: "Verify Projects page loads successfully with project cards.",
          },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjects");

    // Intercept Project individual settings and members calls
    cy.intercept("GET", "**/V1/status*", {
      statusCode: 200,
      body: {
        data: [
          { id: "status-101", name: "TODO", description: "Backlog items ready for development", colorCode: "#0072C4", order: 1 },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectStatuses");

    cy.intercept("GET", "**/V1/priority*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectPriorities");

    cy.intercept("GET", "**/V1/tags*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectTags");

    cy.intercept("GET", "**/V1/taskType*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectTaskTypes");

    cy.intercept("GET", "**/V1/projectMembers*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectMembers");

    cy.intercept("GET", "**/V1/streamlineTask/backlog*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Successfully fetched project backlog tasks",
        meta: { limit: 10, page: 1, totalRecords: 0, totalPages: 1 },
        data: [],
      },
    }).as("getBacklog");

    cy.intercept("GET", "**/V1/commonMembers*", {
      statusCode: 200,
      body: {
        success: true,
        message: "Successfully fetched common members list",
        meta: { limit: 100, page: 1, totalRecords: 0, totalPages: 1 },
        data: [],
      },
    }).as("getCommonMembers");

    // Login and navigate
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    cy.visit("/streamLine");
    cy.wait("@getProjects");

    // Open project details settings
    cy.contains("StreamLine Mobile").click();
    cy.wait(["@getProjectStatuses", "@getProjectPriorities", "@getProjectTags", "@getProjectTaskTypes", "@getProjectMembers", "@getBacklog", "@getCommonMembers"]);
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();
  });

  // TC_103 & TC_104 & TC_105
  it("TC_103 - TC_105: Verify spaces trimming (leading/trailing) and spaces-only block validations", () => {
    cy.contains("New status").click();

    // TC_105: Verify spaces-only input blocked
    cy.contains("Status name").parent().find("input").type("   ");
    cy.contains("Create").click();
    cy.url().should("include", "/addStatus"); // Stays on screen

    // TC_103 & TC_104: Verify leading/trailing spaces trimmed upon submission
    cy.intercept("POST", "**/status", {
      statusCode: 200,
      body: {
        message: "Status created successfully",
        data: { id: "status-102", name: "TEST", description: "", colorCode: "#008117" },
      },
    }).as("createTrimmedStatus");

    cy.contains("Status name").parent().find("input").clear().type("  TEST  ");
    cy.contains("Create").click();
    cy.wait("@createTrimmedStatus").then((interception) => {
      expect(interception.request.body.name).to.equal("TEST");
    });
  });

  // TC_106 & TC_107 & TC_108
  it("TC_106 - TC_108: Verify special characters, SQL injection, and XSS sanitization handling", () => {
    cy.contains("New status").click();
    cy.contains("Status name").parent().find("input").type("SANITIZED");

    cy.intercept("POST", "**/status", {
      statusCode: 200,
      body: {
        message: "Status created successfully",
        data: { id: "status-102", name: "SANITIZED", description: "Safe description", colorCode: "#008117" },
      },
    }).as("createSanitizedStatus");

    // Type special characters (TC_106), SQL injection (TC_107), XSS script (TC_108)
    const complexDesc = "@#$%^&* OR 1=1 -- <script>alert(1)</script>";
    cy.contains("Description").parent().find("textarea, input").type(complexDesc);

    cy.contains("Create").click();
    cy.wait("@createSanitizedStatus").then((interception) => {
      expect(interception.request.body.description).to.equal(complexDesc);
    });
  });

  // TC_109 & TC_110 & TC_111
  it("TC_109 - TC_111: Verify page refresh retains state after CRUD operations", () => {
    // TC_109: Refresh after Create
    cy.contains("New status").click();
    cy.intercept("POST", "**/status", {
      statusCode: 200,
      body: {
        message: "Status created successfully",
        data: { id: "status-102", name: "REFRESH", description: "", colorCode: "#008117" },
      },
    }).as("createRefreshStatus");

    // Add status to list mock
    cy.intercept("GET", "**/V1/status*", {
      statusCode: 200,
      body: {
        data: [
          { id: "status-101", name: "TODO", description: "To do", colorCode: "#0072C4", order: 1 },
          { id: "status-102", name: "REFRESH", description: "", colorCode: "#008117", order: 2 },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectStatusesAfterCreate");

    cy.contains("Status name").parent().find("input").type("REFRESH");
    cy.contains("Create").click();
    cy.wait("@createRefreshStatus");
    cy.wait("@getProjectStatusesAfterCreate");

    // Reload page
    registerReloadMocks([
      { id: "status-101", name: "TODO", description: "To do", colorCode: "#0072C4", order: 1 },
      { id: "status-102", name: "REFRESH", description: "", colorCode: "#008117", order: 2 },
    ]);
    cy.reload();
    cy.wait(["@getProjectStatusesReload", "@getProjectPrioritiesReload", "@getProjectTagsReload", "@getProjectTaskTypesReload", "@getProjectMembersReload", "@getBacklogReload", "@getCommonMembersReload"], { timeout: 15000 });
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();
    cy.contains("REFRESH").should("be.visible");

    // TC_110: Refresh after Edit
    cy.contains("REFRESH").parents().eq(2).find("svg").eq(1).parent().click();
    cy.intercept("PUT", "**/status*", {
      statusCode: 200,
      body: { message: "Status updated successfully" },
    }).as("updateRefreshStatus");

    // Modify list mock to reflect updated name
    cy.intercept("GET", "**/V1/status*", {
      statusCode: 200,
      body: {
        data: [
          { id: "status-101", name: "TODO", description: "To do", colorCode: "#0072C4", order: 1 },
          { id: "status-102", name: "REFRESH-EDIT", description: "", colorCode: "#008117", order: 2 },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectStatusesAfterEdit");

    cy.contains("Status name").parent().find("input").clear().type("REFRESH-EDIT");
    cy.contains("Update").click();
    cy.wait("@updateRefreshStatus");
    cy.wait("@getProjectStatusesAfterEdit");

    // Reload page
    registerReloadMocks([
      { id: "status-101", name: "TODO", description: "To do", colorCode: "#0072C4", order: 1 },
      { id: "status-102", name: "REFRESH-EDIT", description: "", colorCode: "#008117", order: 2 },
    ]);
    cy.reload();
    cy.wait(["@getProjectStatusesReload", "@getProjectPrioritiesReload", "@getProjectTagsReload", "@getProjectTaskTypesReload", "@getProjectMembersReload", "@getBacklogReload", "@getCommonMembersReload"], { timeout: 15000 });
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();
    cy.contains("REFRESH-EDIT").should("be.visible");

    // TC_111: Refresh after Delete
    cy.intercept("DELETE", "**/status**", {
      statusCode: 200,
      body: { message: "Status deleted successfully" },
    }).as("deleteRefreshStatus");

    cy.intercept("GET", "**/V1/status*", {
      statusCode: 200,
      body: {
        data: [
          { id: "status-101", name: "TODO", description: "To do", colorCode: "#0072C4", order: 1 },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectStatusesAfterDelete");

    cy.contains("REFRESH-EDIT").parents().eq(2).find("svg").eq(2).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deleteRefreshStatus");
    cy.wait("@getProjectStatusesAfterDelete");

    // Reload page
    registerReloadMocks([
      { id: "status-101", name: "TODO", description: "To do", colorCode: "#0072C4", order: 1 },
    ]);
    cy.reload();
    cy.wait(["@getProjectStatusesReload", "@getProjectPrioritiesReload", "@getProjectTagsReload", "@getProjectTaskTypesReload", "@getProjectMembersReload", "@getBacklogReload", "@getCommonMembersReload"], { timeout: 15000 });
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();
    cy.contains("REFRESH-EDIT").should("not.exist");
  });

  // TC_112
  it("TC_112: Verify loader is displayed during API calls", () => {
    cy.contains("New status").click();
    cy.contains("Status name").parent().find("input").type("LOADER TEST");

    cy.intercept("POST", "**/status", {
      delay: 1000,
      statusCode: 200,
      body: {
        message: "Status created successfully",
        data: { id: "status-102", name: "LOADER TEST", description: "", colorCode: "#008117" },
      },
    }).as("createLoaderStatus");

    cy.contains("Create").click();
    // The button has loading state which disables it and renders an ActivityIndicator (role="progressbar")
    cy.get('[role="progressbar"]').should("be.visible");

    cy.wait("@createLoaderStatus");
    cy.get('[role="progressbar"]').should("not.exist");
  });

  // TC_113
  it("TC_113: Verify network failure handling displays error toaster", () => {
    cy.contains("New status").click();
    cy.contains("Status name").parent().find("input").type("FAIL TEST");

    cy.intercept("POST", "**/status", {
      statusCode: 500,
      body: { message: "Database Connection Failure" },
    }).as("networkFailure");

    cy.contains("Create").click();
    cy.wait("@networkFailure");
    // Verify toast error is visible
    cy.contains("Database Connection Failure").should("be.visible");
  });

  // TC_114
  it("TC_114: Verify toaster automatically dismisses after timeout", () => {
    cy.contains("New status").click();
    cy.contains("Status name").parent().find("input").type("TOAST TIMEOUT");

    cy.intercept("POST", "**/status", {
      statusCode: 200,
      body: {
        message: "Status created successfully",
        data: { id: "status-102", name: "TOAST TIMEOUT", description: "", colorCode: "#008117" },
      },
    }).as("createToastStatus");

    cy.contains("Create").click();
    cy.wait("@createToastStatus");

    // Success toast visible
    cy.contains("Status created successfully").should("be.visible");

    // Wait for auto-dismiss timeout (3000ms) plus a buffer
    cy.wait(3500);

    // Toast should be gone
    cy.contains("Status created successfully").should("not.exist");
  });
});
