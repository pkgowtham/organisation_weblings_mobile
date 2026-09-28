// cypress/e2e/individualSetting/issuesType.cy.js

describe("StreamLine Mobile - Project Issues Type Functional Suite (TC_087 to TC_102)", () => {
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
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
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
      body: {
        data: [
          { id: "tasktype-101", name: "Feature", description: "New features development", colorCode: "#008117" },
          { id: "tasktype-102", name: "Bug", description: "Application bugs and crashes", colorCode: "#e00028" },
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

    // Open project details settings
    cy.contains("StreamLine Mobile").click();
    cy.wait(["@getProjectStatuses", "@getProjectPriorities", "@getProjectTags", "@getProjectTaskTypes", "@getProjectMembers"]);
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();

    // Switch to Issues Type sub-tab
    cy.contains("Status").parents().filter(':has(:contains("Priority"))').first().contains("Issues Type").click();
  });

  // TC_087
  it("TC_087: Verify all issue types are displayed in Issues Type list", () => {
    cy.contains("Issues Type").should("be.visible");
    cy.contains("Feature").should("be.visible");
    cy.contains("Bug").should("be.visible");
  });

  // TC_088 to TC_094
  it("TC_088 - TC_094: Verify Create Issues Type form opens, validations check, and successful creation", () => {
    // TC_088: Verify form opens successfully
    cy.contains("New Issue type").click();
    cy.url().should("include", "/addTaskType");
    cy.get('div:contains("New Issue Type")').filter(':visible').first().should("be.visible");
    cy.contains("Live Preview").should("be.visible");
    cy.contains("Basic Info").should("be.visible");
    cy.contains(/^Issue Type$/).should("be.visible");
    cy.contains("Description").should("be.visible");
    cy.contains("Color").should("be.visible");

    // TC_089: Mandatory validation
    cy.contains("Create").click();
    cy.url().should("include", "/addTaskType"); // Stays on form screen

    // TC_091: Duplicate validation during creation
    cy.intercept("POST", "**/taskType", {
      statusCode: 400,
      body: { message: "Issue type Feature already exists in this project" },
    }).as("createDuplicateIssueType");

    cy.contains(/^Issue Type$/).parent().find("input").type("Feature");
    cy.contains("Create").click();
    cy.wait("@createDuplicateIssueType");
    cy.contains("Issue type Feature already exists in this project").should("be.visible");

    // TC_092: 150-char validation limit
    cy.contains(/^Issue Type$/).parent().find("input").clear();
    cy.intercept("POST", "**/taskType", {
      statusCode: 400,
      body: { message: "Issue type name cannot exceed 150 characters" },
    }).as("createMaxLengthIssueType");

    cy.contains(/^Issue Type$/).parent().find("input").type("A".repeat(151));
    cy.contains("Create").click();
    cy.wait("@createMaxLengthIssueType");
    cy.contains("Issue type name cannot exceed 150 characters").should("be.visible");

    // TC_093: 500-char description limit
    cy.contains(/^Issue Type$/).parent().find("input").clear().type("Chore");
    cy.intercept("POST", "**/taskType", {
      statusCode: 400,
      body: { message: "Description cannot exceed 500 characters" },
    }).as("createMaxLengthDescIssueType");

    cy.contains("Description").parent().find("textarea, input").type("B".repeat(501));
    cy.contains("Create").click();
    cy.wait("@createMaxLengthDescIssueType");
    cy.contains("Description cannot exceed 500 characters").should("be.visible");

    // TC_090 & TC_094: Valid creation flow & success toaster
    cy.contains("Description").parent().find("textarea, input").clear().type("Project chore tasks");
    cy.contains("Color").parent().find('[style*="background-color"]').eq(4).click(); // select info color

    cy.intercept("POST", "**/taskType", {
      statusCode: 200,
      body: {
        message: "Issue type created successfully",
        data: { id: "tasktype-103", name: "Chore", description: "Project chore tasks", colorCode: "#9e29fe" },
      },
    }).as("createIssueTypeSuccess");

    cy.contains("Create").click();
    cy.wait("@createIssueTypeSuccess");
    cy.contains("Issue type created successfully").should("be.visible");
    cy.url().should("include", "/projectDetails");
  });

  // TC_095 to TC_097
  it("TC_095 - TC_097: Verify edit flow, prepopulated values, duplicate validation, and successful update with toaster", () => {
    // Click edit on Feature (eq(0) SVG inside card since there's no custom icon before edit in IssueType SettingsItemCard)
    cy.contains("Feature").parents().eq(2).find("svg").eq(0).parent().click();
    cy.url().should("include", "/addTaskType");
    cy.contains("Edit Issue Type").filter(':visible').should("be.visible");
    cy.contains(/^Issue Type$/).parent().find("input").should("have.value", "Feature");

    // TC_096: Duplicate validation during edit
    cy.intercept("PUT", "**/taskType*", {
      statusCode: 400,
      body: { message: "Issue Type with name Bug already exists" },
    }).as("updateIssueTypeDuplicate");

    cy.contains(/^Issue Type$/).parent().find("input").clear().type("Bug");
    cy.contains("Update").click();
    cy.wait("@updateIssueTypeDuplicate");
    cy.contains("Issue Type with name Bug already exists").should("be.visible");

    // TC_095 & TC_097: Valid update and toaster
    cy.contains(/^Issue Type$/).parent().find("input").clear().type("Enhancement");
    cy.contains("Description").parent().find("textarea, input").clear().type("Feature enhancement updates");

    cy.intercept("PUT", "**/taskType*", {
      statusCode: 200,
      body: { message: "Issue type updated successfully" },
    }).as("updateIssueTypeSuccess");

    cy.contains("Update").click();
    cy.wait("@updateIssueTypeSuccess");
    cy.contains("Issue type updated successfully").should("be.visible");
    cy.url().should("include", "/projectDetails");
  });

  // TC_098 to TC_102
  it("TC_098 - TC_102: Verify delete confirmation modal opens, cancel option, successful deletion, and API failure handling", () => {
    // TC_098: Click delete (eq(1) SVG inside Feature card) and check modal
    cy.contains("Feature").parents().eq(2).find("svg").eq(1).parent().click();
    cy.contains("Delete Issue Type").should("be.visible");

    // TC_099: Cancel deletion
    cy.contains("Cancel").click();
    cy.contains("Delete Issue Type").should("not.exist");
    cy.contains("Feature").should("be.visible");

    // TC_102: API failure handling
    cy.intercept("DELETE", "**/taskType**", {
      statusCode: 500,
      body: { message: "Delete issue type failed on server" },
    }).as("deleteIssueTypeFailure");

    cy.contains("Feature").parents().eq(2).find("svg").eq(1).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deleteIssueTypeFailure");
    cy.contains("Delete issue type failed on server").should("be.visible");

    // TC_100 & TC_101: Successful deletion
    cy.intercept("DELETE", "**/taskType**", {
      statusCode: 200,
      body: { message: "Issue type deleted successfully" },
    }).as("deleteIssueTypeSuccess");

    cy.intercept("GET", "**/taskType*", {
      statusCode: 200,
      body: {
        data: [{ id: "tasktype-102", name: "Bug", description: "Application bugs and crashes", colorCode: "#e00028" }],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectTaskTypesAfterDelete");

    cy.contains("Feature").parents().eq(2).find("svg").eq(1).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deleteIssueTypeSuccess");
    cy.wait("@getProjectTaskTypesAfterDelete");

    cy.contains("Issue type deleted successfully").should("be.visible");
    cy.contains("Feature").should("not.exist");
  });
});
