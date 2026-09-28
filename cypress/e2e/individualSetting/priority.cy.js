// cypress/e2e/individualSetting/priority.cy.js

describe("StreamLine Mobile - Project Priority Functional Suite (TC_056 to TC_071)", () => {
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
      body: {
        data: [
          { id: "priority-101", name: "Urgent", description: "Immediate attention required", colorCode: "#e00028" },
          { id: "priority-102", name: "High", description: "High impact", colorCode: "#b15600" },
        ],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
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

    // Switch to Priority sub-tab
    cy.contains("Status").parents().filter(':has(:contains("Priority"))').first().contains("Priority").click();
  });

  // TC_056
  it("TC_056: Verify Priority list loads successfully and displays all priorities", () => {
    cy.contains("Priority").should("be.visible");
    cy.contains("Urgent").should("be.visible");
    cy.contains("High").should("be.visible");
  });

  // TC_057 to TC_063
  it("TC_057 - TC_063: Verify Create Priority form, validations, and creation flow", () => {
    // TC_057: Form opens successfully
    cy.contains("New Priority").click();
    cy.url().should("include", "/addPriority");
    cy.get('div:contains("New Priority")').filter(':visible').first().should("be.visible");
    cy.contains("Basic Info").should("be.visible");
    cy.contains("Priority name").should("be.visible");
    cy.contains("Description").should("be.visible");
    cy.contains("Color").should("be.visible");

    // TC_058: Mandatory validation
    cy.contains("Create").click();
    cy.url().should("include", "/addPriority"); // Stays on creation screen

    // TC_060: Duplicate priority validation
    cy.intercept("POST", "**/priority", {
      statusCode: 400,
      body: { message: "Priority name already exists in this project" },
    }).as("createDuplicatePriority");

    cy.contains("Priority name").parent().find("input").type("High");
    cy.contains("Create").click();
    cy.wait("@createDuplicatePriority");
    cy.contains("Priority name already exists in this project").should("be.visible");

    // TC_061: 150-char limit validation
    cy.contains("Priority name").parent().find("input").clear();
    cy.intercept("POST", "**/priority", {
      statusCode: 400,
      body: { message: "Priority name cannot exceed 150 characters" },
    }).as("createMaxLengthPriority");

    cy.contains("Priority name").parent().find("input").type("A".repeat(151));
    cy.contains("Create").click();
    cy.wait("@createMaxLengthPriority");
    cy.contains("Priority name cannot exceed 150 characters").should("be.visible");

    // TC_062: 500-char description limit
    cy.contains("Priority name").parent().find("input").clear().type("Low");
    cy.intercept("POST", "**/priority", {
      statusCode: 400,
      body: { message: "Description cannot exceed 500 characters" },
    }).as("createMaxLengthDescPriority");

    cy.contains("Description").parent().find("textarea, input").type("B".repeat(501));
    cy.contains("Create").click();
    cy.wait("@createMaxLengthDescPriority");
    cy.contains("Description cannot exceed 500 characters").should("be.visible");

    // TC_059 & TC_063: Valid priority creation & success toaster
    cy.contains("Description").parent().find("textarea, input").clear().type("Low impact tasks");
    cy.contains("Color").parent().find('[style*="background-color"]').eq(5).click(); // select neutral gray color

    cy.intercept("POST", "**/priority", {
      statusCode: 200,
      body: {
        message: "Priority created successfully",
        data: { id: "priority-103", name: "Low", description: "Low impact tasks", colorCode: "#8d8d8d" },
      },
    }).as("createPrioritySuccess");

    cy.contains("Create").click();
    cy.wait("@createPrioritySuccess");
    cy.contains("Priority created successfully").should("be.visible");
    cy.url().should("include", "/projectDetails");
  });

  // TC_064 to TC_066
  it("TC_064 - TC_066: Verify priority update functional flows and validation", () => {
    // Click edit on High card (eq(1) SVG inside high card, since high card has FlagIcon SVG first)
    cy.contains("High").parents().eq(2).find("svg").eq(1).parent().click();
    cy.url().should("include", "/addPriority");
    cy.contains("Edit Priority").should("be.visible");
    cy.contains("Priority name").parent().find("input").should("have.value", "High");

    // TC_065: Duplicate validation during edit
    cy.intercept("PUT", "**/priority*", {
      statusCode: 400,
      body: { message: "Priority name already exists" },
    }).as("updatePriorityDuplicate");

    cy.contains("Priority name").parent().find("input").clear().type("Urgent");
    cy.contains("Update").click();
    cy.wait("@updatePriorityDuplicate");
    cy.contains("Priority name already exists").should("be.visible");

    // TC_064 & TC_066: Successful update functional flow and update toaster
    cy.contains("Priority name").parent().find("input").clear().type("CRITICAL");
    cy.contains("Description").parent().find("textarea, input").clear().type("System down urgency");

    cy.intercept("PUT", "**/priority*", {
      statusCode: 200,
      body: { message: "Priority updated successfully" },
    }).as("updatePrioritySuccess");

    cy.contains("Update").click();
    cy.wait("@updatePrioritySuccess");
    cy.contains("Priority updated successfully").should("be.visible");
    cy.url().should("include", "/projectDetails");
  });

  // TC_067 to TC_071
  it("TC_067 - TC_071: Verify Delete Priority confirmation modal, cancel delete, successful delete, and error handling", () => {
    // TC_067: Delete modal opens
    cy.contains("High").parents().eq(2).find("svg").eq(2).parent().click();
    cy.contains("Delete Priority").should("be.visible");
    cy.contains("Are you sure you want to delete this priority?").should("be.visible");

    // TC_068: Cancel delete functionality
    cy.contains("Cancel").click();
    cy.contains("Delete Priority").should("not.exist");
    cy.contains("High").should("be.visible");

    // TC_071: API failure handling during delete
    cy.intercept("DELETE", "**/priority**", {
      statusCode: 500,
      body: { message: "Delete priority failed on server" },
    }).as("deletePriorityFailure");

    cy.contains("High").parents().eq(2).find("svg").eq(2).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deletePriorityFailure");
    cy.contains("Delete priority failed on server").should("be.visible");

    // TC_069 & TC_070: Successful delete flow and success toaster
    cy.intercept("DELETE", "**/priority**", {
      statusCode: 200,
      body: { message: "Priority deleted successfully" },
    }).as("deletePrioritySuccess");

    cy.intercept("GET", "**/priority*", {
      statusCode: 200,
      body: {
        data: [{ id: "priority-101", name: "Urgent", description: "Immediate attention required", colorCode: "#e00028" }],
        meta: { page: 1, limit: 10, totalPages: 1 },
      },
    }).as("getProjectPrioritiesAfterDelete");

    cy.contains("High").parents().eq(2).find("svg").eq(2).parent().click();
    cy.contains(/^Delete$/).click();
    cy.wait("@deletePrioritySuccess");
    cy.wait("@getProjectPrioritiesAfterDelete");

    cy.contains("Priority deleted successfully").should("be.visible");
    cy.contains("High").should("not.exist");
  });
});
