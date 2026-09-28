// cypress/e2e/individualSetting/tag.cy.js

describe("StreamLine Mobile - Project Tag Functional Suite (TC_072 to TC_086)", () => {
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
      body: {
        data: [
          { id: "tag-101", name: "UI-Design", colorCode: "#0072C4" },
          { id: "tag-102", name: "Bugfix", colorCode: "#e00028" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectTags");

    cy.intercept("GET", "**/V1/taskType*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10, totalPages: 1 } },
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

    // Switch to Tag sub-tab
    cy.contains("Status").parents().filter(':has(:contains("Priority"))').first().contains("Tag").click();
  });

  // TC_072
  it("TC_072: Verify all tags are displayed in Tag list", () => {
    cy.contains("Tags").should("be.visible");
    cy.contains("UI-Design").should("be.visible");
    cy.contains("Bugfix").should("be.visible");
  });

  // TC_073 to TC_078
  it("TC_073 - TC_078: Verify inline tag creation row, color cycle, validations, and success toaster", () => {
    // TC_073: Click New Tag opens inline tag creation row
    cy.contains("New Tag").click();
    cy.get('input[placeholder="Tag name"]').should("be.visible");
    cy.get('input[placeholder="Tag name"]').parent().parent().find('[style*="background-color:"]').should("be.visible");
    cy.contains("Add").should("be.visible");

    // TC_074: Tag Name mandatory validation
    cy.contains("Add").click(); // click with empty input
    // verify inline row is still open and no API request is sent
    cy.get('input[placeholder="Tag name"]').should("be.visible");

    // TC_076: Duplicate tag name validation
    cy.intercept("POST", "**/tags", {
      statusCode: 400,
      body: { message: "Tag with name UI-Design already exists in this project" },
    }).as("createDuplicateTag");

    cy.get('input[placeholder="Tag name"]').type("UI-Design");
    cy.contains("Add").click();
    cy.wait("@createDuplicateTag");
    cy.contains("Tag with name UI-Design already exists in this project").should("be.visible");

    // TC_077: 150-char validation limit
    cy.get('input[placeholder="Tag name"]').clear();
    cy.intercept("POST", "**/tags", {
      statusCode: 400,
      body: { message: "Tag name cannot exceed 150 characters" },
    }).as("createMaxLengthTag");

    cy.get('input[placeholder="Tag name"]').type("A".repeat(151));
    cy.contains("Add").click();
    cy.wait("@createMaxLengthTag");
    cy.contains("Tag name cannot exceed 150 characters").should("be.visible");

    // TC_075 & TC_078: Valid tag creation and success toaster
    cy.get('input[placeholder="Tag name"]').clear().type("QA-Testing");
    // Cycle color option (click mini color circle)
    cy.get('input[placeholder="Tag name"]').parent().parent().find('[style*="background-color:"]').eq(0).click();

    cy.intercept("POST", "**/tags", {
      statusCode: 200,
      body: {
        message: "Tag created successfully",
        data: { id: "tag-103", name: "QA-Testing", colorCode: "#0072C4" },
      },
    }).as("createTagSuccess");

    cy.intercept("GET", "**/tags*", {
      statusCode: 200,
      body: {
        data: [
          { id: "tag-101", name: "UI-Design", colorCode: "#0072C4" },
          { id: "tag-102", name: "Bugfix", colorCode: "#e00028" },
          { id: "tag-103", name: "QA-Testing", colorCode: "#0072C4" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectTagsAfterCreate");

    cy.contains("Add").click();
    cy.wait("@createTagSuccess");
    cy.wait("@getProjectTagsAfterCreate");

    cy.contains("Tag created successfully").should("be.visible");
    cy.contains("QA-Testing").should("be.visible");
  });

  // TC_079 to TC_081
  it("TC_079 - TC_081: Verify inline edit option allows updates and validates duplicates", () => {
    // Click edit on UI-Design (first card in mock list, eq(0) SVG inside card)
    cy.contains("UI-Design").parents().eq(2).find("svg").eq(0).parent().click();
    cy.get('input[placeholder="Tag name"]').should("have.value", "UI-Design");

    // TC_080: Duplicate validation during edit
    cy.intercept("PUT", "**/tags*", {
      statusCode: 400,
      body: { message: "Tag name already exists" },
    }).as("updateTagDuplicate");

    cy.get('input[placeholder="Tag name"]').clear().type("Bugfix");
    cy.contains("Update").click();
    cy.wait("@updateTagDuplicate");
    cy.contains("Tag name already exists").should("be.visible");

    // TC_079 & TC_081: Valid tag edit functionality and update toaster
    cy.intercept("PUT", "**/tags*", {
      statusCode: 200,
      body: { message: "Tag updated successfully" },
    }).as("updateTagSuccess");

    cy.intercept("GET", "**/tags*", {
      statusCode: 200,
      body: {
        data: [
          { id: "tag-101", name: "UI-NewDesign", colorCode: "#0072C4" },
          { id: "tag-102", name: "Bugfix", colorCode: "#e00028" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectTagsAfterUpdate");

    cy.get('input[placeholder="Tag name"]').clear().type("UI-NewDesign");
    cy.contains("Update").click();
    cy.wait("@updateTagSuccess");
    cy.wait("@getProjectTagsAfterUpdate");

    cy.contains("Tag updated successfully").should("be.visible");
    cy.contains("UI-NewDesign").should("be.visible");
    cy.contains("UI-Design").should("not.exist");
  });

  // TC_082 to TC_086
  it("TC_082 - TC_086: Verify tag deletion confirmation, cancel, success, and error toaster behavior", () => {
    // TC_082: Click Delete icon (eq(1) SVG inside UI-Design card) and verify modal opens
    cy.contains("UI-Design").parents().eq(2).find("svg").eq(1).parent().click();
    cy.contains("Delete Tag").should("be.visible");

    // TC_083: Cancel deletion
    cy.contains("Cancel").click();
    cy.contains("Delete Tag").should("not.exist");
    cy.contains("UI-Design").should("be.visible");

    // TC_086: API failure handling
    cy.intercept("DELETE", "**/tags**", {
      statusCode: 500,
      body: { message: "Delete tag failed on database server" },
    }).as("deleteTagFailure");

    cy.contains("UI-Design").parents().eq(2).find("svg").eq(1).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deleteTagFailure");
    cy.contains("Delete tag failed on database server").should("be.visible");

    // TC_084 & TC_085: Successful deletion and toaster
    cy.intercept("DELETE", "**/tags**", {
      statusCode: 200,
      body: { message: "Tag deleted successfully" },
    }).as("deleteTagSuccess");

    cy.intercept("GET", "**/tags*", {
      statusCode: 200,
      body: {
        data: [{ id: "tag-102", name: "Bugfix", colorCode: "#e00028" }],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectTagsAfterDelete");

    cy.contains("UI-Design").parents().eq(2).find("svg").eq(1).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deleteTagSuccess");
    cy.wait("@getProjectTagsAfterDelete");

    cy.contains("Tag deleted successfully").should("be.visible");
    cy.contains("UI-Design").should("not.exist");
  });
});
