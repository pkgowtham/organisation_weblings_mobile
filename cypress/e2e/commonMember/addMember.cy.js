// cypress/e2e/commonMember/addMember.cy.js

describe("StreamLine Mobile - Add Member Functional Suite (TC_031 to TC_053)", () => {
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
    cy.intercept("GET", "**/project*", { statusCode: 200, body: { data: [] } }).as("getProjects");
    cy.intercept("GET", "**/commonPriority*", { statusCode: 200, body: { data: [] } }).as("getPriorities");
    cy.intercept("GET", "**/commonTags*", { statusCode: 200, body: { data: [] } }).as("getTags");
    cy.intercept("GET", "**/commonTaskType*", { statusCode: 200, body: { data: [] } }).as("getTaskTypes");
    cy.intercept("GET", "**/commonStatus*", { statusCode: 200, body: { data: [] } }).as("getStatuses");
    cy.intercept("GET", "**/projectMembers*", { statusCode: 200, body: { data: [] } }).as("getMembers");

    // Execute login and navigate to Add Member page
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    cy.visit("/streamLine");
    cy.wait(["@getProjects", "@getPriorities", "@getStatuses", "@getTags", "@getMembers", "@getTaskTypes"]);

    cy.contains("Members").click();
    cy.contains("New member").click();
    cy.contains("Add Member").click();
  });

  // TC_031 to TC_035
  it("TC_031 to TC_035: Verify Add Member page loads successfully and displays UI fields", () => {
    // TC_031: Verify route path/URL
    cy.url().should("include", "/addMember");
    cy.contains("Add Member").should("be.visible");

    // TC_032: Verify profile/icon upload area
    cy.contains("Click here to").should("be.visible");
    cy.contains("upload Group").should("be.visible");

    // TC_033: Verify Name field is visible
    cy.contains("Name").should("be.visible");
    cy.get('input[placeholder="Enter a name"]').should("be.visible");

    // TC_034: Verify Job Title field is visible
    cy.contains("Job Title").should("be.visible");
    cy.get('input[placeholder="Enter a job title"]').should("be.visible");

    // TC_035: Verify Email field is visible
    cy.contains("Email").should("be.visible");
    cy.get('input[placeholder="Enter a email"]').should("be.visible");
  });

  // TC_036 & TC_037 & TC_042 & TC_045
  it("TC_036 & TC_037 & TC_042 & TC_045: Verify mandatory validations and initial disabled state", () => {
    // TC_036: Button is disabled initially
    cy.contains("Add member").parent().should("have.attr", "aria-disabled", "true");

    // TC_037: Name mandatory validation
    cy.contains("Name").parent().find("input").type("A").clear();
    cy.contains("Name is required").should("be.visible");

    // TC_042: Job Title mandatory validation
    cy.contains("Job Title").parent().find("input").type("B").clear();
    cy.contains("Job Title is required").should("be.visible");

    // TC_045: Email mandatory validation
    cy.contains("Email").parent().find("input").type("C").clear();
    cy.contains("Email is required").should("be.visible");
  });

  // TC_038 to TC_041: Name Input Validations
  it("TC_038 to TC_041: Verify Name field validations (valid value, spaces only, max length, special characters)", () => {
    // TC_038: Accept valid value
    cy.contains("Name").parent().find("input").type("Gowtham");
    cy.contains("Name is required").should("not.exist");

    // TC_039: Spaces only check
    cy.contains("Name").parent().find("input").clear().type("   ");
    cy.contains("Name is required").should("be.visible");

    // TC_040: Max length validation (limit is 150 characters)
    const longName = "A".repeat(151);
    cy.contains("Name").parent().find("input").clear().type(longName);
    cy.contains("Name cannot exceed 150 characters").should("be.visible");

    // TC_041: Special characters validation
    cy.contains("Name").parent().find("input").clear().type("Gowtham@123");
    cy.contains("Name should contain only letters and spaces").should("be.visible");
  });

  // TC_043 & TC_044: Job Title Validations
  it("TC_043 & TC_044: Verify Job Title field validations (valid value, max length)", () => {
    // TC_043: Accept valid job title
    cy.contains("Job Title").parent().find("input").type("QA Engineer");
    cy.contains("Job Title is required").should("not.exist");

    // TC_044: Max length validation (limit is 100 characters)
    const longTitle = "B".repeat(101);
    cy.contains("Job Title").parent().find("input").clear().type(longTitle);
    cy.contains("Job Title cannot exceed 100 characters").should("be.visible");
  });

  // TC_046 to TC_049: Email Input Validations
  it("TC_046 to TC_049: Verify Email validations (valid email, invalid format, without domain, duplicate check)", () => {
    // TC_046: Accept valid email format
    cy.contains("Email").parent().find("input").type("user@gmail.com");
    cy.contains("Invalid email format").should("not.exist");

    // TC_047: Invalid format check (missing @ and domain)
    cy.contains("Email").parent().find("input").clear().type("usergmail.com");
    cy.contains("Invalid email format").should("be.visible");

    // TC_048: Missing domain check
    cy.contains("Email").parent().find("input").clear().type("user@");
    cy.contains("Invalid email format").should("be.visible");

    // TC_049: Duplicate email check (mocking server response for existing email)
    cy.intercept("POST", "**/projectMembers", {
      statusCode: 400,
      body: { message: "Email already exists" },
    }).as("createDuplicateEmail");

    // Type duplicate email and fill other fields
    cy.contains("Name").parent().find("input").clear().type("Gowtham");
    cy.contains("Job Title").parent().find("input").clear().type("QA Engineer");
    cy.contains("Email").parent().find("input").clear().type("existing@weblings.com");
    
    // Trigger creation
    cy.contains("Add member").click();
    cy.wait("@createDuplicateEmail");
    cy.contains("Email already exists").should("be.visible");
  });

  // TC_050 to TC_053: Form Submit Actions
  it("TC_050 to TC_052: Verify successful member creation flow and success toast", () => {
    // Mock successful member creation
    cy.intercept("POST", "**/projectMembers", {
      statusCode: 201,
      body: { message: "Member created successfully" },
    }).as("createMemberSuccess");

    // TC_050: Button is enabled after valid inputs
    cy.contains("Name").parent().find("input").type("Gowtham");
    cy.contains("Job Title").parent().find("input").type("QA Engineer");
    cy.contains("Email").parent().find("input").type("gowtham@weblings.com");
    cy.contains("Add member").parent().should("not.have.attr", "aria-disabled");

    // TC_051: Trigger creation
    cy.contains("Add member").click();
    cy.wait("@createMemberSuccess");

    // TC_052: Verify success toast message and navigation back
    cy.contains("Member created successfully").should("be.visible");
    cy.url().should("not.include", "/addMember");
  });

  it("TC_053: Verify API failure handling on member creation displays error toast", () => {
    // Mock failed member creation
    cy.intercept("POST", "**/projectMembers", {
      statusCode: 500,
      body: { message: "Internal server error occurred" },
    }).as("createMemberFailure");

    // Fill valid data
    cy.contains("Name").parent().find("input").type("Gowtham");
    cy.contains("Job Title").parent().find("input").type("QA Engineer");
    cy.contains("Email").parent().find("input").type("gowtham@weblings.com");

    cy.contains("Add member").click();
    cy.wait("@createMemberFailure");

    // Verify error toast message
    cy.contains(/Internal server error occurred|Network request failed|Internal server error/).should("be.visible");
  });
});
