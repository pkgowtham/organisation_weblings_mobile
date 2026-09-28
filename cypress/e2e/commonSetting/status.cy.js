// cypress/e2e/commonSetting/status.cy.js

describe("Streamline Settings - Status functional suite", () => {
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

    // Intercept project and member calls on Streamline mount
    cy.intercept("GET", "**/project*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getProjects");

    cy.intercept("GET", "**/projectMembers*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getMembers");

    cy.intercept("GET", "**/commonPriority*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getPriorities");

    cy.intercept("GET", "**/commonTags*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getTags");

    cy.intercept("GET", "**/commonTaskType*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getTaskTypes");

    // Initial mock statuses
    cy.intercept("GET", "**/commonStatus*", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "status-101",
            name: "TODO",
            description: "Backlog items ready for development",
            colorCode: "#0072C4",
            order: "1",
          },
          {
            id: "status-102",
            name: "IN PROGRESS",
            description: "Active items",
            colorCode: "#9e29fe",
            order: "2",
          },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getStatuses");

    // Execute login and navigate to settings tab
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    // Click Stream Line tab
    cy.visit("/streamLine");
    cy.wait(["@getProjects", "@getPriorities", "@getStatuses", "@getTags", "@getMembers", "@getTaskTypes"]);

    // Click settings sub-tab header
    cy.contains("Settings").click();
  });

  // TC_001 & TC_002
  it("TC_001 & TC_002: Verify Status settings page loads successfully and all existing statuses are displayed", () => {
    cy.contains("Status").should("be.visible");
    cy.contains("Drag to rearrange : issues will be executed in the following order").should("be.visible");
    
    // Check if both statuses render in the list
    cy.contains("TODO").should("be.visible");
    cy.contains("IN PROGRESS").should("be.visible");
  });

  // TC_003 & TC_004
  it("TC_003 & TC_004: Verify Create Status screen opens successfully and displays UI elements", () => {
    cy.contains("New status").click();
    cy.url().should("include", "/CommonAddStatus");
    
    // Verify UI components in mobile layout
    cy.get('div:contains("New Status")').filter(':visible').first().should("be.visible");
    cy.contains("Live Preview").should("be.visible");
    cy.contains("Basic Info").should("be.visible");
    cy.contains("Status name").should("be.visible");
    cy.contains("Description").should("be.visible");
    cy.contains("Color").should("be.visible");
    cy.contains("Cancel").should("be.visible");
    cy.contains("Create").should("be.visible");
  });

  // TC_005
  it("TC_005: Verify Status Name field is mandatory", () => {
    cy.contains("New status").click();
    cy.url().should("include", "/CommonAddStatus");

    // Attempt to submit empty status name
    cy.contains("Create").click();
    // Verify we stay on the same screen (did not submit)
    cy.url().should("include", "/CommonAddStatus");
  });

  // TC_006 & TC_007
  it("TC_006 & TC_007: Verify status creation with valid data and color selection", () => {
    cy.intercept("POST", "**/commonStatus", {
      statusCode: 200,
      body: {
        message: "Status created successfully",
        data: {
          id: "status-103",
          name: "DONE",
          description: "Completed tasks",
          colorCode: "#008117",
        },
      },
    }).as("createStatus");

    cy.contains("New status").click();
    
    // Fill form
    cy.contains("Status name").parent().find("input").type("DONE");
    cy.contains("Description").parent().find("textarea, input").type("Completed tasks");

    // Select color from picker (e.g. positive color #008117 which is 3rd element in COLOR_OPTIONS)
    cy.contains("Color").parent().find('[style*="background-color"]').eq(2).click();

    // Submit
    cy.contains("Create").click();
    cy.wait("@createStatus");

    // Verify it navigated back to settings
    cy.url().should("include", "/streamLine");
  });

  // TC_008
  it("TC_008: Verify Cancel button closes Create Status modal and discards data", () => {
    cy.contains("New status").click();
    cy.contains("Status name").parent().find("input").type("TEMP STATUS");
    cy.contains("Cancel").click();
    
    // Navigated back
    cy.url().should("include", "/streamLine");
    cy.contains("TEMP STATUS").should("not.exist");
  });

  // TC_009 & TC_010
  it("TC_009 & TC_010: Verify Edit screen opens with existing status details and saves updates", () => {
    // Intercept single status GET
    cy.intercept("GET", "**/commonStatus/status-101", {
      statusCode: 200,
      body: {
        data: {
          id: "status-101",
          name: "TODO",
          description: "Backlog items ready for development",
          colorCode: "#0072C4",
        },
      },
    }).as("getStatusDetail");

    cy.intercept("PUT", "**/commonStatus*", {
      statusCode: 200,
      body: {
        message: "Status updated successfully",
      },
    }).as("updateStatus");

    // Click the Edit icon on the TODO card.
    // The edit icon is the second SVG in the card (drag, edit, delete).
    cy.contains("TODO").parents().eq(2).find("svg").eq(1).parent().click();
    
    cy.wait("@getStatusDetail");
    cy.url().should("include", "/CommonAddStatus");

    // Verify details are pre-populated
    cy.contains("Status name").parent().find("input").should("have.value", "TODO");
    cy.contains("Description").parent().find("textarea, input").should("have.value", "Backlog items ready for development");

    // Update details
    cy.contains("Status name").parent().find("input").clear().type("BACKLOG");
    cy.contains("Update").click();
    cy.wait("@updateStatus");

    // Navigates back
    cy.url().should("include", "/streamLine");
  });

  // TC_011 to TC_015 (Direct Delete Flow)
  it("TC_011 - TC_015: Verify status deletion triggers API call and removes item from list", () => {
    cy.intercept("DELETE", "**/commonStatus?id=status-101", {
      statusCode: 200,
      body: {
        message: "Status deleted successfully",
      },
    }).as("deleteStatus");

    // Re-mock GET status lists returning only the remaining items
    cy.intercept("GET", "**/commonStatus*", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "status-102",
            name: "IN PROGRESS",
            description: "Active items",
            colorCode: "#9e29fe",
            order: "2",
          },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getStatusesAfterDelete");

    // Click delete icon (third SVG in card, index 2)
    cy.contains("TODO").parents().eq(2).find("svg").eq(2).parent().click();
    
    // Click Delete in confirmation dialog
    cy.contains(/^Delete$/).click();
    
    cy.wait("@deleteStatus");
    cy.wait("@getStatusesAfterDelete");

    // Verify item is removed
    cy.contains("TODO").should("not.exist");
    cy.contains("IN PROGRESS").should("be.visible");
  });

  // TC_016
  it("TC_016: Verify status order rearrangement drag handle visibility", () => {
    // Verify the drag handle is visible on the cards
    // The 6-dot drag handle is rendered as Svg inside the card when showDragHandle is true.
    cy.contains("TODO").parents().eq(2).find("svg").should("have.length", 3); // drag, edit, delete
  });
});
