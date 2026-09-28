// cypress/e2e/individualSetting/status.cy.js

describe("StreamLine Mobile - Project Status Functional Suite (TC_013 to TC_055)", () => {
  const registerReloadMocks = () => {
    cy.intercept("GET", "**/V1/status*", {
      statusCode: 200,
      body: {
        data: [
          { id: "status-101", name: "TODO", description: "Backlog items ready for development", colorCode: "#0072C4", order: 1 },
          { id: "status-102", name: "IN PROGRESS", description: "Active items", colorCode: "#9e29fe", order: 2 },
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
          { id: "status-102", name: "IN PROGRESS", description: "Active items", colorCode: "#9e29fe", order: 2 },
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

  // TC_013 to TC_018
  it("TC_013 - TC_018: Verify Status list loads, status details display correctly, and actions are visible", () => {
    // TC_013 & TC_014 & TC_018: Verify status list and names load in saved order
    cy.contains("TODO").should("be.visible");
    cy.contains("IN PROGRESS").should("be.visible");

    // TC_015 & TC_016 & TC_017: Verify drag handle, edit icon, and delete icon are displayed in card
    // Cards should render SettingsItemCard which has 3 SVGs (drag, edit, delete) when showDragHandle is true
    cy.contains("TODO").parents().eq(2).find("svg").should("have.length", 3);
  });

  // TC_019 to TC_023
  it("TC_019 - TC_023: Verify status order rearrangement drag and drop flow", () => {
    // Intercept status reorder success
    cy.intercept("PATCH", "**/status/reorder", {
      statusCode: 200,
      body: { message: "Status reordered successfully" },
    }).as("reorderStatusSuccess");

    // TC_019 & TC_020: Simulate drag status and position updated
    cy.contains("TODO").parents().eq(2).find("svg").eq(0).parent()
      .trigger("touchstart", { touches: [{ pageX: 100, pageY: 100, clientX: 100, clientY: 100 }] })
      .trigger("pointerdown", { which: 1, buttons: 1, pointerId: 1, pageX: 100, pageY: 100, clientX: 100, clientY: 100 })
      .trigger("mousedown", { which: 1, buttons: 1, pageX: 100, pageY: 100, clientX: 100, clientY: 100 });

    cy.get("body")
      .trigger("touchmove", { touches: [{ pageX: 100, pageY: 200, clientX: 100, clientY: 200 }] })
      .trigger("pointermove", { which: 1, buttons: 1, pointerId: 1, pageX: 100, pageY: 200, clientX: 100, clientY: 200 })
      .trigger("mousemove", { which: 1, buttons: 1, pageX: 100, pageY: 200, clientX: 100, clientY: 200 })
      .trigger("touchend", { touches: [], changedTouches: [{ pageX: 100, pageY: 200, clientX: 100, clientY: 200 }] })
      .trigger("pointerup", { force: true, which: 1, buttons: 0, pointerId: 1, pageX: 100, pageY: 200, clientX: 100, clientY: 200 })
      .trigger("mouseup", { force: true, which: 1, buttons: 0, pageX: 100, pageY: 200, clientX: 100, clientY: 200 });

    // TC_022: Success toaster displayed
    cy.wait("@reorderStatusSuccess");
    cy.contains("Status reordered successfully").should("be.visible");

    // TC_021: Verify order persists after refresh
    registerReloadMocks();
    cy.reload();
    cy.wait(["@getProjectStatusesReload", "@getProjectPrioritiesReload", "@getProjectTagsReload", "@getProjectTaskTypesReload", "@getProjectMembersReload", "@getBacklogReload", "@getCommonMembersReload"], { timeout: 15000 });
    cy.contains("Timeline").parents().eq(1).contains("Settings").click();
    cy.contains("TODO").should("be.visible");

    // TC_023: API failure handling during reorder
    cy.intercept("PATCH", "**/status/reorder", {
      statusCode: 500,
      body: { message: "Failed to reorder status" },
    }).as("reorderStatusFailure");

    cy.contains("TODO").parents().eq(2).find("svg").eq(0).parent()
      .trigger("touchstart", { touches: [{ pageX: 100, pageY: 100, clientX: 100, clientY: 100 }] })
      .trigger("pointerdown", { which: 1, buttons: 1, pointerId: 1, pageX: 100, pageY: 100, clientX: 100, clientY: 100 })
      .trigger("mousedown", { which: 1, buttons: 1, pageX: 100, pageY: 100, clientX: 100, clientY: 100 });

    cy.get("body")
      .trigger("touchmove", { touches: [{ pageX: 100, pageY: 200, clientX: 100, clientY: 200 }] })
      .trigger("pointermove", { which: 1, buttons: 1, pointerId: 1, pageX: 100, pageY: 200, clientX: 100, clientY: 200 })
      .trigger("mousemove", { which: 1, buttons: 1, pageX: 100, pageY: 200, clientX: 100, clientY: 200 })
      .trigger("touchend", { touches: [], changedTouches: [{ pageX: 100, pageY: 200, clientX: 100, clientY: 200 }] })
      .trigger("pointerup", { force: true, which: 1, buttons: 0, pointerId: 1, pageX: 100, pageY: 200, clientX: 100, clientY: 200 })
      .trigger("mouseup", { force: true, which: 1, buttons: 0, pageX: 100, pageY: 200, clientX: 100, clientY: 200 });

    cy.wait("@reorderStatusFailure");
    cy.contains("Failed to reorder status").should("be.visible");
  });

  // TC_024 to TC_038
  it("TC_024 - TC_038: Verify Create Status button, form elements, validations, and creation flows", () => {
    // TC_024: New Status button is visible
    cy.contains("New status").should("be.visible");

    // TC_025: Clicking New Status opens creation form
    cy.contains("New status").click();
    cy.url().should("include", "/addStatus");

    // TC_026 & TC_027 & TC_028: Fields visible
    cy.get('div:contains("New Status")').filter(':visible').first().should("be.visible");
    cy.contains("Live Preview").should("be.visible");
    cy.contains("Basic Info").should("be.visible");
    cy.contains("Status name").should("be.visible");
    cy.contains("Description").should("be.visible");
    cy.contains("Color").should("be.visible");

    // TC_029 & TC_030 & TC_031: Validation checks on empty form
    cy.contains("Create").click();
    cy.url().should("include", "/addStatus"); // Stays on form (prevented submission)

    // Spaces only name validation
    cy.contains("Status name").parent().find("input").type("   ");
    cy.contains("Create").click();
    cy.url().should("include", "/addStatus"); // Stays on form

    // TC_032 & TC_036 & TC_037: Valid Status creation with color selection
    cy.intercept("POST", "**/status", {
      statusCode: 200,
      body: {
        message: "Status created successfully",
        data: { id: "status-103", name: "DONE", description: "Completed tasks", colorCode: "#008117" },
      },
    }).as("createStatusSuccess");

    cy.contains("Status name").parent().find("input").clear().type("DONE");
    cy.contains("Description").parent().find("textarea, input").type("Completed tasks");
    // TC_036: Color picker interaction (3rd option #008117)
    cy.contains("Color").parent().find('[style*="background-color"]').eq(2).click();

    cy.contains("Create").click();
    cy.wait("@createStatusSuccess");
    cy.contains("Status created successfully").should("be.visible");
    cy.url().should("include", "/projectDetails");

    // TC_033: Duplicate Status creation validation
    cy.contains("New status").click();
    cy.intercept("POST", "**/status", {
      statusCode: 400,
      body: { message: "Status name already exists in this project" },
    }).as("createStatusDuplicate");

    cy.contains("Status name").parent().find("input").type("DONE");
    cy.contains("Create").click();
    cy.wait("@createStatusDuplicate");
    cy.contains("Status name already exists in this project").should("be.visible");

    // TC_034: Max length validation (>150 chars)
    cy.contains("Status name").parent().find("input").clear();
    cy.intercept("POST", "**/status", {
      statusCode: 400,
      body: { message: "Status name cannot exceed 150 characters" },
    }).as("createStatusMaxLength");

    cy.contains("Status name").parent().find("input").type("A".repeat(151));
    cy.contains("Create").click();
    cy.wait("@createStatusMaxLength");
    cy.contains("Status name cannot exceed 150 characters").should("be.visible");

    // TC_035: Description max length validation (>500 chars)
    cy.contains("Status name").parent().find("input").clear().type("TEST LIMIT");
    cy.contains("Description").parent().find("textarea, input").clear();
    cy.intercept("POST", "**/status", {
      statusCode: 400,
      body: { message: "Description cannot exceed 500 characters" },
    }).as("createStatusDescMaxLength");

    cy.contains("Description").parent().find("textarea, input").type("B".repeat(501));
    cy.contains("Create").click();
    cy.wait("@createStatusDescMaxLength");
    cy.contains("Description cannot exceed 500 characters").should("be.visible");

    // TC_038: API failure handling
    cy.contains("Description").parent().find("textarea, input").clear().type("Valid description");
    cy.intercept("POST", "**/status", {
      statusCode: 500,
      body: { message: "Database server error" },
    }).as("createStatusApiFailure");

    cy.contains("Create").click();
    cy.wait("@createStatusApiFailure");
    cy.contains("Database server error").should("be.visible");
  });

  // TC_039 to TC_048
  it("TC_039 - TC_048: Verify Edit Status page opens, pre-populates details, validates inputs, and updates status", () => {
    // Intercept single status details fetch if needed, but react native local params is used
    cy.intercept("PUT", "**/status*", {
      statusCode: 200,
      body: { message: "Status updated successfully" },
    }).as("updateStatusSuccess");

    // TC_039 & TC_040: Click edit icon for TODO (eq(1) SVG) and check values populated
    cy.contains("TODO").parents().eq(2).find("svg").eq(1).parent().click();
    cy.url().should("include", "/addStatus");
    cy.contains("Edit Status").should("be.visible");
    cy.contains("Status name").parent().find("input").should("have.value", "TODO");
    cy.contains("Description").parent().find("textarea, input").should("have.value", "Backlog items ready for development");

    // TC_044: Mandatory validation during edit
    cy.contains("Status name").parent().find("input").clear();
    cy.contains("Update").click();
    cy.url().should("include", "/addStatus"); // stays on screen

    // TC_045: Duplicate validation during edit
    cy.intercept("PUT", "**/status*", {
      statusCode: 400,
      body: { message: "Status name already exists" },
    }).as("updateStatusDuplicate");

    cy.contains("Status name").parent().find("input").type("IN PROGRESS");
    cy.contains("Update").click();
    cy.wait("@updateStatusDuplicate");
    cy.contains("Status name already exists").should("be.visible");

    // TC_041 & TC_042 & TC_043 & TC_046 & TC_047: Valid Update
    cy.contains("Status name").parent().find("input").clear().type("BACKLOG");
    cy.contains("Description").parent().find("textarea, input").clear().type("New backlog description");
    cy.contains("Color").parent().find('[style*="background-color"]').eq(4).click(); // cycle to different color

    cy.intercept("PUT", "**/status*", {
      statusCode: 200,
      body: { message: "Status updated successfully" },
    }).as("updateStatusSuccess");

    cy.contains("Update").click();
    cy.wait("@updateStatusSuccess");
    cy.contains("Status updated successfully").should("be.visible");
    cy.url().should("include", "/projectDetails");

    // TC_048: API failure during update
    cy.contains("TODO").parents().eq(2).find("svg").eq(1).parent().click();
    cy.intercept("PUT", "**/status*", {
      statusCode: 500,
      body: { message: "Internal update failure" },
    }).as("updateStatusApiFailure");

    cy.contains("Status name").parent().find("input").clear().type("FAIL TEST");
    cy.contains("Update").click();
    cy.wait("@updateStatusApiFailure");
    cy.contains("Internal update failure").should("be.visible");
  });

  // TC_049 to TC_055
  it("TC_049 - TC_055: Verify Delete Status confirmation modal, cancel behavior, and successful delete flows", () => {
    // TC_049 & TC_050: Click delete icon (eq(2) SVG inside card) and check buttons on modal
    cy.contains("TODO").parents().eq(2).find("svg").eq(2).parent().click();
    cy.contains("Delete Status").should("be.visible");
    cy.contains("Are you sure you want to delete this status?").should("be.visible");
    cy.contains("Cancel").should("be.visible");
    cy.contains("Delete").should("be.visible");

    // TC_051: Cancel deletion functionality
    cy.contains("Cancel").click();
    cy.contains("Delete Status").should("not.exist");
    cy.contains("TODO").should("be.visible"); // Remains in list

    // TC_055: API failure handling during delete
    cy.intercept("DELETE", "**/status**", {
      statusCode: 500,
      body: { message: "Delete action failed on server" },
    }).as("deleteStatusFailure");

    cy.contains("TODO").parents().eq(2).find("svg").eq(2).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deleteStatusFailure");
    cy.contains("Delete action failed on server").should("be.visible");

    // TC_052 & TC_053 & TC_054: Successful deletion
    cy.intercept("DELETE", "**/status**", {
      statusCode: 200,
      body: { message: "Status deleted successfully" },
    }).as("deleteStatusSuccess");

    // Re-mock GET status to remove TODO
    cy.intercept("GET", "**/V1/status*", {
      statusCode: 200,
      body: {
        data: [
          { id: "status-102", name: "IN PROGRESS", description: "Active items", colorCode: "#9e29fe", order: 2 },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectStatusesAfterDelete");

    cy.contains("TODO").parents().eq(2).find("svg").eq(2).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deleteStatusSuccess");
    cy.wait("@getProjectStatusesAfterDelete");

    // Success toaster shown
    cy.contains("Status deleted successfully").should("be.visible");
    // Verify removed from list
    cy.contains("TODO").should("not.exist");
    cy.contains("IN PROGRESS").should("be.visible");
  });
});
