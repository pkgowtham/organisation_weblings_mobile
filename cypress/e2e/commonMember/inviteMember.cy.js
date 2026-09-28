// cypress/e2e/commonMember/inviteMember.cy.js

describe("StreamLine Mobile - Invite Member Functional Suite (TC_054 to TC_068)", () => {
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

    // Intercept lists
    cy.intercept("GET", "**/project*", { statusCode: 200, body: { data: [] } }).as("getProjects");
    cy.intercept("GET", "**/commonPriority*", { statusCode: 200, body: { data: [] } }).as("getPriorities");
    cy.intercept("GET", "**/commonTags*", { statusCode: 200, body: { data: [] } }).as("getTags");
    cy.intercept("GET", "**/commonTaskType*", { statusCode: 200, body: { data: [] } }).as("getTaskTypes");
    cy.intercept("GET", "**/commonStatus*", { statusCode: 200, body: { data: [] } }).as("getStatuses");
    cy.intercept("GET", "**/projectMembers*", { statusCode: 200, body: { data: [] } }).as("getMembers");

    // Execute login and navigate to Invite Member page
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    cy.visit("/streamLine");
    cy.wait(["@getProjects", "@getPriorities", "@getStatuses", "@getTags", "@getMembers", "@getTaskTypes"]);

    cy.contains("Members").click();
    cy.contains("New member").click();
    cy.contains("Invite Member").click();
  });

  // TC_054 to TC_056
  it("TC_054 to TC_056: Verify Invite Member page loads and displays preset emails and input field", () => {
    // TC_054: Verify page URL and headers
    cy.url().should("include", "/inviteMember");
    cy.contains("Invite Member").should("be.visible");
    cy.contains("Add your team").should("be.visible");

    // TC_055: Verify existing preset/invited emails chip list are displayed
    cy.contains("user1@gmail.com").should("be.visible");
    cy.contains("user2@gmail.com").should("be.visible");
    cy.contains("user3@gmail.com").should("be.visible");
    cy.contains("user4@gmail.com").should("be.visible");
    cy.contains("user5@gmail.com").should("be.visible");

    // TC_056: Verify email input field is displayed
    cy.get('input[placeholder="Enter Email address"]').should("be.visible");
  });

  // TC_057 to TC_061
  it("TC_057 to TC_061: Verify adding, validating, and removing emails from chip list", () => {
    // TC_057: Verify valid email entry
    cy.get('input[placeholder="Enter Email address"]').type("newuser@gmail.com");
    // Click Send icon button (next to input field)
    cy.get('input[placeholder="Enter Email address"]').parent().find("svg").click();
    cy.contains("newuser@gmail.com").should("be.visible");

    // TC_058: Verify invalid email format validation
    cy.get('input[placeholder="Enter Email address"]').type("invalidemail");
    cy.get('input[placeholder="Enter Email address"]').parent().find("svg").click();
    cy.contains("Invalid email format").should("be.visible");

    // TC_059: Verify duplicate email validation
    cy.get('input[placeholder="Enter Email address"]').type("newuser@gmail.com");
    cy.get('input[placeholder="Enter Email address"]').parent().find("svg").click();
    cy.contains("Email address already added").should("be.visible");

    // TC_060: Verify multiple emails can be added
    cy.get('input[placeholder="Enter Email address"]').clear().type("user6@gmail.com");
    cy.get('input[placeholder="Enter Email address"]').parent().find("svg").click();
    cy.get('input[placeholder="Enter Email address"]').clear().type("user7@gmail.com");
    cy.get('input[placeholder="Enter Email address"]').parent().find("svg").click();

    cy.contains("user6@gmail.com").should("be.visible");
    cy.contains("user7@gmail.com").should("be.visible");

    // TC_061: Verify remove email chip functionality
    // Click close icon (X) on newuser@gmail.com chip
    cy.contains("newuser@gmail.com").parent().find("svg").click();
    cy.contains("newuser@gmail.com").should("not.exist");
  });

  // TC_062 & TC_063
  it("TC_062 & TC_063: Verify Invite button enabled/disabled states based on chip list contents", () => {
    // The button displays dynamically count-based title, e.g. "Invite 5 members"
    cy.contains("Invite 5 members").should("be.visible");

    // TC_062: Remove all 5 preset emails to verify disabled state when empty
    for (let i = 1; i <= 5; i++) {
      cy.contains(`user${i}@gmail.com`).parent().find("svg").click();
    }
    
    // Once empty, the button title becomes "Invite members" and disabled
    cy.contains("Invite 0 members").parent().should("have.attr", "aria-disabled", "true");

    // TC_063: Verify button becomes enabled after adding at least one email
    cy.get('input[placeholder="Enter Email address"]').type("active@weblings.com");
    cy.get('input[placeholder="Enter Email address"]').parent().find("svg").click();
    
    cy.contains("Invite 1 member").parent().should("not.have.attr", "aria-disabled");
  });

  // TC_064 to TC_067: Invite Action APIs
  it("TC_064 & TC_065: Verify successful invitation send flow and toaster display", () => {
    // Intercept successful invitations POST
    cy.intercept("POST", "**/commonMembers/invite", {
      statusCode: 200,
      body: { message: "Invitations sent successfully" },
    }).as("inviteSuccess");

    cy.contains("Invite 5 members").click();
    cy.wait("@inviteSuccess");

    // TC_065: Success toaster message displayed
    cy.contains("Invitations sent successfully").should("be.visible");
    cy.url().should("not.include", "/inviteMember");
  });

  it("TC_066 & TC_067: Verify API failure handling and email retention after validation failure", () => {
    // Intercept failure invitations POST
    cy.intercept("POST", "**/commonMembers/invite", {
      statusCode: 400,
      body: { message: "Failed to invite some email addresses" },
    }).as("inviteFailure");

    cy.contains("Invite 5 members").click();
    cy.wait("@inviteFailure");

    // TC_066: Error toaster message displayed
    cy.contains("Failed to invite some email addresses").should("be.visible");

    // TC_067: Verify emails are still in list (retained) after failure to allow retry
    cy.contains("user1@gmail.com").should("be.visible");
    cy.contains("user5@gmail.com").should("be.visible");
  });

  // TC_068: Maximum email count
  it("TC_068: Verify maximum email count handling behaves correctly under large inputs", () => {
    // Add multiple additional emails
    for (let i = 10; i < 35; i++) {
      cy.get('input[placeholder="Enter Email address"]').type(`bulkuser${i}@gmail.com`);
      cy.get('input[placeholder="Enter Email address"]').parent().find("svg").click();
    }
    // Verify total count updates in button label
    cy.contains("Invite 30 members").should("be.visible");
  });
});
