// cypress/e2e/commonSetting/issuesType.cy.js

describe("Streamline Settings - Issues Type functional suite", () => {
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

    cy.intercept("GET", "**/commonPriority*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getPriorities");

    cy.intercept("GET", "**/commonTags*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getTags");

    // Initial mock task types (Issues Type)
    cy.intercept("GET", "**/commonTaskType*", {
      statusCode: 200,
      body: {
        data: [
          { id: "tasktype-1", name: "Feature", description: "New features development", colorCode: "#008117" },
          { id: "tasktype-2", name: "Bug", description: "Application bugs and crashes", colorCode: "#e00028" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getTaskTypes");

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
    // Switch to Issues Type tab
    cy.contains("Issues Type").click();
  });

  // TC_061 & TC_062 & TC_063
  it("TC_061 to TC_063: Verify Issues Type page loads and displays existing task types and creation option", () => {
    cy.contains("Issues Type").should("be.visible");
    cy.contains("Feature").should("be.visible");
    cy.contains("Bug").should("be.visible");
    cy.contains("New Issue type").should("be.visible");
  });

  // TC_064 & TC_065
  it("TC_064 & TC_065: Verify clicking New Issue Type navigates to creation page with UI components", () => {
    cy.contains("New Issue type").click();
    cy.url().should("include", "/CommonAddTaskType");
    cy.get('div:contains("New Issue Type")').filter(':visible').first().should("be.visible");
    cy.contains("Live Preview").should("be.visible");
    cy.contains("Basic Info").should("be.visible");
    cy.contains(/^Issue Type$/).should("be.visible");
    cy.contains("Description").should("be.visible");
    cy.contains("Color").should("be.visible");
    cy.contains("Cancel").should("be.visible");
    cy.contains("Create").should("be.visible");
  });

  // TC_066 & TC_069
  it("TC_066 & TC_069: Verify Task Type field is mandatory during creation", () => {
    cy.contains("New Issue type").click();
    cy.contains("Create").click();
    // Verify stay on same page
    cy.url().should("include", "/CommonAddTaskType");
  });

  // TC_067 & TC_068 & TC_070 & TC_073
  it("TC_067 & TC_068 & TC_070 & TC_073: Verify task type creation with valid inputs and color selection", () => {
    cy.intercept("POST", "**/commonTaskType", {
      statusCode: 200,
      body: {
        message: "Issue type created successfully",
        data: { id: "tasktype-3", name: "Testing", description: "QA Activities", colorCode: "#0072C4" },
      },
    }).as("createTaskType");

    cy.contains("New Issue type").click();
    
    // Fill text inputs (TC_067)
    cy.contains(/^Issue Type$/).parent().find("input").type("Testing");
    cy.contains("Description").parent().find("textarea, input").type("QA Activities");

    // Color selection (TC_068)
    cy.contains("Color").parent().find('[style*="background-color"]').eq(3).click(); // index 3 is #0072C4

    // Submit
    cy.contains("Create").click();
    cy.wait("@createTaskType");

    cy.url().should("include", "/streamLine");
  });

  // TC_071 & TC_072
  it("TC_071 & TC_072: Verify Cancel and Back (Close) buttons exit the creation flow", () => {
    // Test cancel button
    cy.contains("New Issue type").click();
    cy.contains("Cancel").click();
    cy.url().should("include", "/streamLine");

    // Test back icon in top bar (TC_072)
    cy.contains("New Issue type").click();
    // The back icon is the SVG on the left of the topBar
    cy.get('[style*="padding-top:"]').find("svg").eq(0).click();
    cy.url().should("include", "/streamLine");
  });

  // TC_074 to TC_080: Action Menu and Edit flows
  it("TC_074 to TC_080: Verify editing a task type updates properties successfully", () => {
    cy.intercept("GET", "**/commonTaskType/tasktype-1", {
      statusCode: 200,
      body: {
        data: { id: "tasktype-1", name: "Feature", description: "New features development", colorCode: "#008117" },
      },
    }).as("getTaskTypeDetail");

    cy.intercept("PUT", "**/commonTaskType*", {
      statusCode: 200,
      body: { message: "Task type updated successfully" },
    }).as("updateTaskType");

    // Click Edit icon on Feature card (first SVG in row actions)
    cy.contains("Feature").parents().eq(2).find("svg").eq(0).parent().click();
    cy.wait("@getTaskTypeDetail");
    cy.url().should("include", "/CommonAddTaskType");

    // Check pre-populated details (TC_076)
    cy.contains(/^Issue Type$/).parent().find("input").should("have.value", "Feature");

    // Update values (TC_077, TC_078, TC_079)
    cy.contains(/^Issue Type$/).parent().find("input").clear().type("Enhancement");
    cy.contains("Description").parent().find("textarea, input").clear().type("Minor improvements");
    cy.contains("Color").parent().find('[style*="background-color"]').eq(4).click(); // select info color

    cy.contains("Update").click();
    cy.wait("@updateTaskType");

    cy.url().should("include", "/streamLine");
  });

  // TC_081
  it("TC_081: Verify Cancel button during edit discards changes", () => {
    cy.contains("Feature").parents().eq(2).find("svg").eq(0).parent().click();
    cy.contains(/^Issue Type$/).parent().find("input").clear().type("Discarded Edit");
    cy.contains("Cancel").click();
    
    cy.url().should("include", "/streamLine");
    cy.contains("Discarded Edit").should("not.exist");
  });

  // TC_083: Duplicate Checks
  it("TC_083: Verify duplicate creation behavior shows error validation toast", () => {
    cy.intercept("POST", "**/commonTaskType", {
      statusCode: 400,
      body: { message: "Task type with name Feature already exists" },
    }).as("createDuplicateTaskType");

    cy.contains("New Issue type").click();
    cy.contains(/^Issue Type$/).parent().find("input").type("Feature");
    cy.contains("Create").click();
    cy.wait("@createDuplicateTaskType");

    // Validate error toast
    cy.contains("Task type with name Feature already exists").should("be.visible");
  });

  // TC_086 to TC_090: Deletion Flow
  it("TC_086 to TC_090: Verify deleting task type calls API and removes item from list", () => {
    cy.intercept("DELETE", "**/commonTaskType?id=tasktype-1", {
      statusCode: 200,
      body: { message: "Task type deleted successfully" },
    }).as("deleteTaskType");

    cy.intercept("GET", "**/commonTaskType*", {
      statusCode: 200,
      body: {
        data: [{ id: "tasktype-2", name: "Bug", description: "Application bugs and crashes", colorCode: "#e00028" }],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getTaskTypesAfterDelete");

    // Click delete icon (second SVG in row actions)
    cy.contains("Feature").parents().eq(2).find("svg").eq(1).parent().click();
    
    // Click Delete in confirmation dialog
    cy.contains(/^Delete$/).click();
    
    cy.wait("@deleteTaskType");
    cy.wait("@getTaskTypesAfterDelete");

    cy.contains("Feature").should("not.exist");
  });

  // TC_096 & TC_097: Spaces handling
  it("TC_096 & TC_097: Verify validation and spaces trimming behaviors", () => {
    cy.contains("New Issue type").click();
    
    // Only spaces (TC_096)
    cy.contains(/^Issue Type$/).parent().find("input").type("    ");
    cy.contains("Create").click();
    cy.url().should("include", "/CommonAddTaskType"); // Should stay on form screen
    
    // Trimming spaces (TC_097)
    cy.intercept("POST", "**/commonTaskType", {
      statusCode: 200,
      body: {
        message: "Created",
        data: { id: "tasktype-4", name: "Trimmable", description: "description", colorCode: "#008117" },
      },
    }).as("createTrimmed");

    cy.contains(/^Issue Type$/).parent().find("input").clear().type("  Trimmable  ");
    cy.contains("Create").click();
    
    cy.wait("@createTrimmed").then((xhr) => {
      expect(xhr.request.body.name).to.equal("Trimmable");
    });
  });

  // TC_093 to TC_095: API Failures
  it("TC_093 - TC_095: Verify API error responses display correct messages in toasts", () => {
    cy.intercept("POST", "**/commonTaskType", {
      statusCode: 500,
      body: { message: "Failed to contact database server" },
    }).as("apiFailureCreate");

    cy.contains("New Issue type").click();
    cy.contains(/^Issue Type$/).parent().find("input").type("Error Type");
    cy.contains("Create").click();
    cy.wait("@apiFailureCreate");

    cy.contains("Failed to contact database server").should("be.visible");
  });
});
