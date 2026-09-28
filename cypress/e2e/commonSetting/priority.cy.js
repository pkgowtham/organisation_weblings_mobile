// cypress/e2e/commonSetting/priority.cy.js

describe("Streamline Settings - Priority functional suite", () => {
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

    // Intercept default lists
    cy.intercept("GET", "**/project*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getProjects");

    cy.intercept("GET", "**/projectMembers*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getMembers");

    cy.intercept("GET", "**/commonStatus*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getStatuses");

    cy.intercept("GET", "**/commonTags*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getTags");

    cy.intercept("GET", "**/commonTaskType*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getTaskTypes");

    // Initial mock priorities
    cy.intercept("GET", "**/commonPriority*", {
      statusCode: 200,
      body: {
        data: [
          { id: "priority-1", name: "Urgent", description: "Immediate attention required", colorCode: "#e00028" },
          { id: "priority-2", name: "High", description: "High impact", colorCode: "#b15600" },
          { id: "priority-3", name: "Normal", description: "Default priority", colorCode: "#0072C4" },
          { id: "priority-4", name: "Low", description: "Low impact", colorCode: "#8d8d8d" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getPriorities");

    // Login and navigate
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    cy.visit("/streamLine");
    cy.wait(["@getProjects", "@getPriorities", "@getStatuses", "@getTags", "@getMembers", "@getTaskTypes"]);

    // Click Settings
    cy.contains("Settings").click();
    // Switch to Priority sub-tab
    cy.contains("Priority").click();
  });

  // TC_017 & TC_018
  it("TC_017 & TC_018: Verify Priority settings page loads successfully and all priorities are displayed", () => {
    cy.contains("Priority").should("be.visible");
    cy.contains("Urgent").should("be.visible");
    cy.contains("High").should("be.visible");
    cy.contains("Normal").should("be.visible");
    cy.contains("Low").should("be.visible");
  });

  // TC_019
  it("TC_019: Verify Create Priority page opens successfully", () => {
    cy.contains("New Priority").click();
    cy.url().should("include", "/CommonAddPriority");
    cy.get('div:contains("New Priority")').filter(':visible').first().should("be.visible");
  });

  // TC_020
  it("TC_020: Verify Priority Name field is mandatory", () => {
    cy.contains("New Priority").click();
    cy.url().should("include", "/CommonAddPriority");

    // Click Create with empty input
    cy.contains("Create").click();
    // Should stay on the same screen
    cy.url().should("include", "/CommonAddPriority");
  });

  // TC_021, TC_022
  it("TC_021 & TC_022: Verify priority creation with valid data and color selection", () => {
    cy.intercept("POST", "**/commonPriority", {
      statusCode: 200,
      body: {
        message: "Priority created successfully",
        data: {
          id: "priority-5",
          name: "Critical",
          description: "System down",
          colorCode: "#e00028",
        },
      },
    }).as("createPriority");

    cy.contains("New Priority").click();
    cy.contains("Priority name").parent().find("input").type("Critical");
    cy.contains("Description").parent().find("textarea, input").type("System down");

    // Select color (1st color #e00028 in COLOR_OPTIONS)
    cy.contains("Color").parent().find('[style*="background-color"]').eq(0).click();

    cy.contains("Create").click();
    cy.wait("@createPriority");

    // Navigates back
    cy.url().should("include", "/streamLine");
  });

  // TC_023
  it("TC_023: Verify Cancel button closes Create Priority screen", () => {
    cy.contains("New Priority").click();
    cy.contains("Cancel").click();
    cy.url().should("include", "/streamLine");
  });

  // TC_024 & TC_025
  it("TC_024 & TC_025: Verify Edit screen opens with existing priority details and allows updates", () => {
    cy.intercept("GET", "**/commonPriority/priority-2", {
      statusCode: 200,
      body: {
        data: {
          id: "priority-2",
          name: "High",
          description: "High impact",
          colorCode: "#b15600",
        },
      },
    }).as("getPriorityDetail");

    cy.intercept("PUT", "**/commonPriority/*", {
      statusCode: 200,
      body: {
        message: "Priority updated successfully",
      },
    }).as("updatePriority");

    // Click edit button for High
    cy.contains("High").parents().eq(2).find("svg").eq(1).parent().click();
    cy.wait("@getPriorityDetail");
    cy.url().should("include", "/CommonAddPriority");

    // Verify fields populated
    cy.contains("Priority name").parent().find("input").should("have.value", "High");

    // Modify details
    cy.contains("Priority name").parent().find("input").clear().type("HIGH-ALERT");
    cy.contains("Update").click();
    cy.wait("@updatePriority");

    cy.url().should("include", "/streamLine");
  });

  // TC_026 & TC_028 & TC_029 (Direct Delete on Mobile)
  it("TC_026 & TC_028 & TC_029: Verify priority deletion removes item permanently", () => {
    cy.intercept("DELETE", "**/commonPriority?id=priority-2", {
      statusCode: 200,
      body: {
        message: "Priority deleted successfully",
      },
    }).as("deletePriority");

    cy.intercept("GET", "**/commonPriority*", {
      statusCode: 200,
      body: {
        data: [
          { id: "priority-1", name: "Urgent", description: "Immediate attention required", colorCode: "#e00028" },
          { id: "priority-3", name: "Normal", description: "Default priority", colorCode: "#0072C4" },
          { id: "priority-4", name: "Low", description: "Low impact", colorCode: "#8d8d8d" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getPrioritiesAfterDelete");

    // Click delete icon for High
    cy.contains("High").parents().eq(2).find("svg").eq(2).parent().click();
    
    // Click Delete in confirmation dialog
    cy.contains(/^Delete$/).click();
    
    cy.wait("@deletePriority");
    cy.wait("@getPrioritiesAfterDelete");

    // Confirm it's gone
    cy.contains("High").should("not.exist");
  });
});
