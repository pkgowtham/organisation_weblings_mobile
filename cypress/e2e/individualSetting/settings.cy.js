// cypress/e2e/individualSetting/settings.cy.js

describe("StreamLine Mobile - Projects and Settings Page Navigation Suite (TC_001 to TC_012)", () => {
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
          { id: "status-1", name: "TODO", description: "To do", colorCode: "#0072C4", order: 1 },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectStatuses");

    cy.intercept("GET", "**/V1/priority*", {
      statusCode: 200,
      body: {
        data: [
          { id: "priority-1", name: "High", description: "High impact", colorCode: "#e00028" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectPriorities");

    cy.intercept("GET", "**/V1/tags*", {
      statusCode: 200,
      body: {
        data: [
          { id: "tag-1", name: "UI-Design", colorCode: "#0072C4" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectTags");

    cy.intercept("GET", "**/V1/taskType*", {
      statusCode: 200,
      body: {
        data: [
          { id: "tasktype-1", name: "Bug", description: "Bugs", colorCode: "#e00028" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectTaskTypes");

    cy.intercept("GET", "**/V1/projectMembers*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
    }).as("getProjectMembers");

    // Login and navigate
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    cy.visit("/streamLine");
    cy.wait("@getProjects");
  });

  // TC_001 & TC_002 & TC_003 & TC_004
  it("TC_001 - TC_004: Verify Projects page loads successfully, project card displays, and details are correct", () => {
    // TC_001 & TC_002: Verify Projects loads successfully
    cy.contains("All projects").should("be.visible");
    cy.contains("StreamLine Mobile").should("be.visible");

    // TC_003: Verify project card displays project name
    cy.contains("StreamLine Mobile").should("be.visible");

    // TC_004: Verify project card displays project description
    cy.contains("Verify Projects page loads successfully with project cards.").should("be.visible");
  });

  // TC_005
  it("TC_005: Verify clicking a project opens Project Details page", () => {
    cy.contains("StreamLine Mobile").click();
    cy.url().should("include", "/projectDetails");
    // Wait for internal calls on load
    cy.wait(["@getProjectStatuses", "@getProjectPriorities", "@getProjectTags", "@getProjectTaskTypes", "@getProjectMembers"]);
  });

  // TC_006 & TC_007
  it("TC_006 & TC_007: Verify Settings tab is visible and user can navigate to Settings tab", () => {
    cy.contains("StreamLine Mobile").click();
    cy.wait(["@getProjectStatuses", "@getProjectPriorities", "@getProjectTags", "@getProjectTaskTypes", "@getProjectMembers"]);

    // TC_006: Settings tab visible
    cy.contains("Timeline").parents().eq(1).contains("Settings").should("be.visible");

    // TC_007: Navigate to settings tab
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();
    // Verify we are showing individual settings area (e.g. sub-tab Status is shown)
    cy.contains("Drag to rearrange : issues will be executed in the following order").should("be.visible");
  });

  // TC_008 & TC_009 & TC_010 & TC_011 & TC_012
  it("TC_008 - TC_012: Verify all settings sub-tabs are visible and user can switch between them", () => {
    cy.contains("StreamLine Mobile").click();
    cy.wait(["@getProjectStatuses", "@getProjectPriorities", "@getProjectTags", "@getProjectTaskTypes", "@getProjectMembers"]);
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();

    const subTabBar = () => cy.contains("Status").parents().filter(':has(:contains("Priority"))').first();

    // TC_008: Status tab visible
    subTabBar().contains("Status").should("be.visible");

    // TC_009: Priority tab visible
    subTabBar().contains("Priority").should("be.visible");

    // TC_010: Tag tab visible
    subTabBar().contains("Tag").should("be.visible");

    // TC_011: Issues Type tab visible
    subTabBar().contains("Issues Type").should("be.visible");

    // TC_012: Switch between tabs
    // Switch to Priority
    subTabBar().contains("Priority").click();
    cy.contains("High").should("be.visible");

    // Switch to Tag
    subTabBar().contains("Tag").click();
    cy.contains("UI-Design").should("be.visible");

    // Switch to Issues Type
    subTabBar().contains("Issues Type").click();
    cy.contains("Bug").should("be.visible");

    // Switch back to Status
    subTabBar().contains("Status").click();
    cy.contains("TODO").should("be.visible");
  });
});
