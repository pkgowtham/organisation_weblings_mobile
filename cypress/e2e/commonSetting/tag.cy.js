// cypress/e2e/commonSetting/tag.cy.js

describe("Streamline Settings - Tag functional suite", () => {
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

    cy.intercept("GET", "**/commonTaskType*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getTaskTypes");

    // Initial mock tags
    cy.intercept("GET", "**/commonTags*", {
      statusCode: 200,
      body: {
        data: [
          { id: "tag-1", name: "UI-Design", colorCode: "#0072C4" },
          { id: "tag-2", name: "Bugfix", colorCode: "#e00028" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getTags");

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
    // Switch to Tag sub-tab
    cy.contains("Tag").click();
  });

  // TC_030 & TC_031 & TC_032
  it("TC_030 & TC_031 & TC_032: Verify Tags settings loads successfully with list and New Tag link", () => {
    cy.contains("Tags").should("be.visible");
    cy.contains("UI-Design").should("be.visible");
    cy.contains("Bugfix").should("be.visible");
    cy.contains("New Tag").should("be.visible");
  });

  // TC_033
  it("TC_033: Verify clicking New Tag displays inline tag creation row", () => {
    cy.contains("New Tag").click();
    
    // Inline elements: Tag name placeholder, mini color circle, Close icon, Add button
    cy.get('input[placeholder="Tag name"]').should("be.visible");
    cy.get('[style*="background-color"]').should("be.visible"); // color selector circle
    cy.contains("Add").should("be.visible");
  });

  // TC_034 & TC_035 & TC_036 & TC_037 & TC_039
  it("TC_034 to TC_037 & TC_039: Verify tag creation with inputs and color picker", () => {
    cy.intercept("POST", "**/commonTags", {
      statusCode: 200,
      body: {
        message: "Tag created successfully",
        data: { id: "tag-3", name: "UI Testing", colorCode: "#b15600" },
      },
    }).as("createTag");

    cy.contains("New Tag").click();
    
    // Empty tag name check (TC_034)
    cy.contains("Add").click(); // shouldn't trigger api call if empty
    cy.get("@createTag").should("not.exist");

    // Valid tag name (TC_035)
    cy.get('input[placeholder="Tag name"]').type("UI Testing");

    // Click color picker circle to toggle colors (TC_036)
    cy.get('input[placeholder="Tag name"]').parent().parent().find('[style*="background-color:"]').eq(0).click();

    // Re-intercept GET to return the list including the new tag
    cy.intercept("GET", "**/commonTags*", {
      statusCode: 200,
      body: {
        data: [
          { id: "tag-1", name: "UI-Design", colorCode: "#0072C4" },
          { id: "tag-2", name: "Bugfix", colorCode: "#e00028" },
          { id: "tag-3", name: "UI Testing", colorCode: "#b15600" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getTagsAfterCreate");

    // Save
    cy.contains("Add").click();
    cy.wait("@createTag");
    cy.wait("@getTagsAfterCreate");

    // Dynamic appearance (TC_039)
    cy.contains("UI Testing").should("be.visible");
  });

  // TC_038
  it("TC_038: Verify Cancel/Close icon closes inline tag creation row", () => {
    cy.contains("New Tag").click();
    cy.get('input[placeholder="Tag name"]').type("Discarded Tag");
    
    // Click close/cancel icon
    cy.get('input[placeholder="Tag name"]').parent().parent().find("svg").click();
    
    cy.get('input[placeholder="Tag name"]').should("not.exist");
    cy.contains("Discarded Tag").should("not.exist");
  });

  // TC_040 & TC_041 & TC_042 & TC_043 & TC_044 & TC_045
  it("TC_040 to TC_045: Verify inline edit option allows updates", () => {
    cy.intercept("PUT", "**/commonTags*", {
      statusCode: 200,
      body: {
        message: "Tag updated successfully",
      },
    }).as("updateTag");

    // Click edit button for UI-Design (first card in mock)
    cy.contains("UI-Design").parents().eq(2).find("svg").eq(0).parent().click();

    // Verify populated value (TC_042)
    cy.get('input[placeholder="Tag name"]').should("have.value", "UI-Design");

    // Update value & color
    cy.get('input[placeholder="Tag name"]').clear().type("QA Testing");
    cy.get('input[placeholder="Tag name"]').parent().parent().find('[style*="background-color:"]').eq(0).click();

    // Click Update button
    cy.contains("Update").click();
    cy.wait("@updateTag");
  });

  // TC_046
  it("TC_046: Verify Close icon during edit discards changes", () => {
    cy.contains("UI-Design").parents().eq(2).find("svg").eq(0).parent().click();
    cy.get('input[placeholder="Tag name"]').clear().type("CHANGED NAME");
    
    // Close / Cancel icon
    cy.get('input[placeholder="Tag name"]').parent().parent().find("svg").click();
    
    cy.contains("UI-Design").should("be.visible");
    cy.contains("CHANGED NAME").should("not.exist");
  });

  // TC_048 to TC_052: Tag Deletion
  it("TC_048 to TC_052: Verify tag deletion removes item permanently", () => {
    cy.intercept("DELETE", "**/commonTags?id=tag-1", {
      statusCode: 200,
      body: { message: "Tag deleted successfully" },
    }).as("deleteTag");

    cy.intercept("GET", "**/commonTags*", {
      statusCode: 200,
      body: {
        data: [{ id: "tag-2", name: "Bugfix", colorCode: "#e00028" }],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getTagsAfterDelete");

    // Delete first tag
    cy.contains("UI-Design").parents().eq(2).find("svg").eq(1).parent().click();
    
    // Click Delete in confirmation dialog
    cy.contains(/^Delete$/).click();
    
    cy.wait("@deleteTag");
    cy.wait("@getTagsAfterDelete");

    cy.contains("UI-Design").should("not.exist");
  });

  // TC_053: Duplicate Prevention API Response Handling
  it("TC_053: Verify duplicate tag creation shows validation message", () => {
    cy.intercept("POST", "**/commonTags", {
      statusCode: 400,
      body: { message: "Duplicate tag name not allowed" },
    }).as("createDuplicateTag");

    cy.contains("New Tag").click();
    cy.get('input[placeholder="Tag name"]').type("UI-Design");
    cy.contains("Add").click();
    cy.wait("@createDuplicateTag");

    // Validate error alert / toast shows
    cy.contains("Duplicate tag name not allowed").should("be.visible");
  });

  // TC_058 & TC_059 & TC_060: API failure handle
  it("TC_058 - TC_060: Verify API failures display error toasts correctly", () => {
    // Mock Create API Failure
    cy.intercept("POST", "**/commonTags", {
      statusCode: 500,
      body: { message: "Internal server error" },
    }).as("apiFailureCreate");

    cy.contains("New Tag").click();
    cy.get('input[placeholder="Tag name"]').type("Fail Tag");
    cy.contains("Add").click();
    cy.wait("@apiFailureCreate");

    cy.contains(/Internal server error|Network request failed|Failed to create tag/).should("be.visible");
  });
});
