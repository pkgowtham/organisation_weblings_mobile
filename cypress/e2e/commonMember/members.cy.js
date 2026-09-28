// cypress/e2e/commonMember/members.cy.js

describe("StreamLine Mobile - Members Functional Suite (TC_001 to TC_030)", () => {
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

    // Intercept project and member calls on StreamLine mount
    cy.intercept("GET", "**/project*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getProjects");

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

    cy.intercept("GET", "**/commonStatus*", {
      statusCode: 200,
      body: { data: [], meta: { page: 1, limit: 10 } },
    }).as("getStatuses");

    // Initial mock project members list
    cy.intercept("GET", "**/projectMembers*", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "member-1",
            displayName: "Gowtham",
            email: "gowtham@weblings.com",
            createdAt: "2026-06-09T00:00:00.000Z",
            dP: "https://example.com/avatar1.png",
            projects: [{ id: "proj-1", projectName: "Project A" }],
          },
          {
            id: "member-2",
            displayName: "Rathinavel",
            email: "rathinavel@weblings.com",
            createdAt: "2026-06-09T00:00:00.000Z",
            dP: "https://example.com/avatar2.png",
            projects: [{ id: "proj-2", projectName: "Project B" }],
          },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getMembers");

    // Execute login and navigate to Members tab
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    cy.visit("/streamLine");
    cy.wait(["@getProjects", "@getPriorities", "@getStatuses", "@getTags", "@getMembers", "@getTaskTypes"]);

    // Navigate to Members tab
    cy.contains("Members").click();
  });

  // TC_001 to TC_007
  it("TC_001 to TC_007: Verify Members page loads successfully and card details are displayed correctly", () => {
    // TC_001 & TC_007: Verify page layout and search field
    cy.contains("Members").should("be.visible");
    cy.get('input[placeholder="Search Member"]').should("be.visible");
    cy.contains("New member").should("be.visible");

    // TC_002: Verify all mock members display
    cy.contains("Gowtham").should("be.visible");
    cy.contains("Rathinavel").should("be.visible");

    // TC_003 & TC_004 & TC_005 & TC_006: Verify details on card
    cy.contains("Gowtham").parent().within(() => {
      cy.contains("gowtham@weblings.com").should("be.visible");
      // formatDate maps "2026-06-09" to "9 JUN, 2026"
      cy.contains("ADDED 9 JUN, 2026").should("be.visible");
      cy.contains("Project A").should("be.visible");
    });
  });

  // TC_008 to TC_012: Search Functionality
  it("TC_008 to TC_012: Verify Search Member input and filter behaviors", () => {
    // TC_008: Search by valid full name
    cy.get('input[placeholder="Search Member"]').type("Gowtham");
    cy.contains("Gowtham").should("be.visible");
    cy.contains("Rathinavel").should("not.exist");

    // TC_012: Clear search
    cy.get('input[placeholder="Search Member"]').clear();
    cy.contains("Gowtham").should("be.visible");
    cy.contains("Rathinavel").should("be.visible");

    // TC_009: Search by partial name
    cy.get('input[placeholder="Search Member"]').type("Gow");
    cy.contains("Gowtham").should("be.visible");
    cy.contains("Rathinavel").should("not.exist");

    cy.get('input[placeholder="Search Member"]').clear();

    // TC_010: Search by email address
    cy.get('input[placeholder="Search Member"]').type("gowtham@weblings.com");
    cy.contains("Gowtham").should("be.visible");
    cy.contains("Rathinavel").should("not.exist");

    cy.get('input[placeholder="Search Member"]').clear();

    // TC_011: Search by invalid criteria
    cy.get('input[placeholder="Search Member"]').type("XYZ123");
    cy.contains("Gowtham").should("not.exist");
    cy.contains("Rathinavel").should("not.exist");
  });

  // TC_013 & TC_014
  it("TC_013 & TC_014: Verify close (X) icon presence and modal opening trigger", () => {
    // TC_013: Close icon presence
    cy.contains("Gowtham").parents().eq(2).find("svg").should("be.visible");

    // TC_014: Click close (X) should open Replace Employee modal
    cy.contains("Gowtham").parents().eq(2).find("svg").click();
    cy.contains("Replace Employee").should("be.visible");
  });

  // TC_015 to TC_021: Replace Employee Modal UI & Selection
  it("TC_015 to TC_021: Verify Replace Employee modal components and basic actions", () => {
    // Open modal
    cy.contains("Gowtham").parents().eq(2).find("svg").click();

    // TC_015: Verify modal title
    cy.contains("Replace Employee").should("be.visible");

    // TC_016: Verify employee dropdown component
    cy.contains("New Employee").should("be.visible");
    cy.contains("Select replacement employee").should("be.visible");

    // TC_019: Replace button is disabled initially
    cy.contains(/^Replace$/).parent().should("have.attr", "aria-disabled", "true");

    // TC_017: Click dropdown to list available replacement employees
    cy.contains("Select replacement employee").click();
    // Dropdown contains list of other members. Gowtham should not replace himself.
    // TC_025: Same employee cannot replace himself (excludes current user from list)
    cy.get('[role="dialog"], [aria-modal="true"]').not(':contains("Replace Employee")').within(() => {
      cy.contains("Gowtham").should("not.exist");
      cy.contains("Rathinavel").should("be.visible");

      // TC_018: Select a replacement employee
      cy.contains("Rathinavel").click();
    });

    // TC_020: Replace button becomes enabled after selection
    cy.contains(/^Replace$/).parent().should("not.have.attr", "aria-disabled");

    // TC_021: Cancel button closes modal
    cy.contains("Cancel").click();
    cy.contains("Replace Employee").should("not.exist");
  });

  // TC_022 to TC_024: Replace API Actions
  it("TC_022 & TC_023: Verify successful employee replacement flow and success toast", () => {
    // Intercept successful replacement PUT
    cy.intercept("PUT", "**/projectMembers/replaceEmployee", {
      statusCode: 200,
      body: { message: "Employee replaced successfully" },
    }).as("replaceSuccess");

    // Open modal
    cy.contains("Gowtham").parents().eq(2).find("svg").click();
    cy.contains("Select replacement employee").click();
    
    // Select option in dropdown modal
    cy.get('[role="dialog"], [aria-modal="true"]').not(':contains("Replace Employee")').within(() => {
      cy.contains("Rathinavel").click();
    });

    // TC_022: Click replace
    cy.contains(/^Replace$/).click();
    cy.wait("@replaceSuccess");

    // TC_023: Success toaster message displayed
    cy.contains("Replacement completed successfully").should("be.visible");
    cy.contains("Replace Employee").should("not.exist");
  });

  it("TC_024: Verify API failure handling during replacement displays error toast", () => {
    // Intercept replacement PUT failure
    cy.intercept("PUT", "**/projectMembers/replaceEmployee", {
      statusCode: 500,
      body: { message: "Replacement failed due to internal error" },
    }).as("replaceFailure");

    // Open modal
    cy.contains("Gowtham").parents().eq(2).find("svg").click();
    cy.contains("Select replacement employee").click();
    
    // Select option in dropdown modal
    cy.get('[role="dialog"], [aria-modal="true"]').not(':contains("Replace Employee")').within(() => {
      cy.contains("Rathinavel").click();
    });

    cy.contains(/^Replace$/).click();
    cy.wait("@replaceFailure");

    // TC_024: Error toaster message displayed
    cy.contains(/Replacement failed due to internal error|Network request failed|Failed to replace member/).should("be.visible");
  });

  // TC_026 to TC_030: New Member Button and Popover Menu
  it("TC_026 to TC_030: Verify New Member button, dropdown menu options, and clicking outside to close", () => {
    // TC_026: Button presence
    cy.contains("New member").should("be.visible");

    // TC_027: Clicking New Member displays popover options
    cy.contains("New member").click();
    
    // TC_028 & TC_029: Menu items
    cy.contains("Add Member").should("be.visible");
    cy.contains("Invite Member").should("be.visible");

    // TC_030: Clicking outside (clicking modal backdrop) closes menu
    // The menu uses a full-screen backdrop TouchableWithoutFeedback at style styles.menuBackdrop
    // Let's click at coordinates (10, 10) to simulate clicking outside the dropdown options
    cy.get("body").click(10, 10);
    cy.contains("Add Member").should("not.exist");
    cy.contains("Invite Member").should("not.exist");
  });
});
