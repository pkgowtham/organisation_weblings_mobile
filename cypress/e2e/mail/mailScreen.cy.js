// cypress/e2e/mail/mailScreen.cy.js

describe("Mail Screen End-to-End Functional Suite", () => {
  beforeEach(() => {
    // Intercept default initial list fetching requests to control data states
    cy.intercept("GET", "**/email/emailList*", {
      statusCode: 200,
      body: {
        total: 2,
        data: [
          {
            message_id: "mail-101",
            from: "sender@example.com",
            to: "testmail@temporary.com",
            subject: "Project Verification Update",
            body: "Hey team, here is the updated deployment script outline.",
            attachment: [],
            recipient_email: "testmail@temporary.com",
            archive: false,
            markImportant: false,
            trash: false,
            isSpam: false,
            createdAt: "2026-06-01T10:00:00.000Z",
          },
          {
            message_id: "mail-102",
            from: "boss@corporate.com",
            to: "testmail@temporary.com",
            subject: "Urgent Q2 Review Required",
            body: "Please look over the compiled metrics before tomorrow afternoon.",
            attachment: ["report.pdf"],
            recipient_email: "testmail@temporary.com",
            archive: false,
            markImportant: true,
            trash: false,
            isSpam: false,
            createdAt: "2026-06-01T11:30:00.000Z",
          },
        ],
      },
    }).as("getEmails");

    cy.intercept("GET", "**/tag/tagList*", {
      statusCode: 200,
      body: [],
    }).as("getTags");

    // Visit the mail screen route
    cy.visit("/mail");
    cy.wait(["@getEmails", "@getTags"]);
  });

  // --- CATEGORY 1: BASE SCREEN INITIALIZATION & LAYOUT RENDER ---
  describe("Screen Composition & Component Layout Checks", () => {
    it("should correctly render top bars, search labels, and contacts lists", () => {
      // Validate TopBar inherits correct default active context label
      cy.get('[data-testid="mail-top-bar"]')
        .should("be.visible")
        .and("contain", "Inbox");

      // Verify recent contacts populate down dynamically from mock hook timer execution
      cy.get('[data-testid="recent-contacts-container"]').should("be.visible");
      cy.get('[data-testid="contact-item"]').should("have.length", 4);

      // Verify that the float compose element renders cleanly with absolute target positioning
      cy.get('[data-testid="compose-button"]')
        .should("be.visible")
        .and("have.css", "position", "absolute");
    });

    it("should display conditional placeholder copy when no messages match requirements", () => {
      // Simulate an empty mailbox return structure
      cy.intercept("GET", "**/email/emailList*", {
        statusCode: 200,
        body: { total: 0, data: [] },
      }).as("getEmptyEmails");

      cy.visit("/mail");
      cy.wait("@getEmptyEmails");

      cy.get('[data-testid="no-mails-text"]')
        .should("be.visible")
        .and("contain", "No mails to display");
    });
  });

  // --- CATEGORY 2: MUTATION EVENTS (SINGLE & BULK SELECTIONS) ---
  describe("State Mutators & Multi-Selection Lifecycle Matrix", () => {
    it("should trigger transactional visibility updates upon long press interaction", () => {
      // Long press or contextual selector to flag multi-choice processing active
      cy.get('[data-testid="mail-card-mail-101"]').trigger("contextmenu");

      // Top bar needs to switch state representations programmatically
      cy.get('[data-testid="selected-count-label"]').should(
        "contain",
        "1 selected",
      );

      // Toggle matching secondary item via typical sequential interaction click
      cy.get('[data-testid="mail-card-mail-102"]').click();
      cy.get('[data-testid="selected-count-label"]').should(
        "contain",
        "2 selected",
      );

      // Tap clear action handler element to flush state clean
      cy.get('[data-testid="clear-selection-btn"]').click();
      cy.get('[data-testid="selected-count-label"]').should("not.exist");
    });

    it("should push a structural array payload upon confirming single item delete action", () => {
      cy.intercept("PUT", "**/email/update", {
        statusCode: 200,
        body: {
          message: "Item relocated to Trash system bucket successfully.",
        },
      }).as("putMailUpdate");

      // Trigger swipe/button target action event context manually on specific card
      cy.get('[data-testid="delete-mail-101-btn"]').click({ force: true });

      // Ensure data structural tracking payload maps properly to upstream API definitions
      cy.wait("@putMailUpdate").then((interception) => {
        const reqBody = interception.request.body;
        expect(reqBody).to.be.an("array").with.lengthOf(1);
        expect(reqBody[0]).to.deep.include({
          message_id: "mail-101",
          trash: true,
        });
      });
    });

    it("should marshal bulk payloads appropriately when bulk mutators execute", () => {
      cy.intercept("PUT", "**/email/update", {
        statusCode: 200,
        body: { message: "Items batch updated." },
      }).as("putBulkUpdate");

      // Select multiple messages
      cy.get('[data-testid="mail-card-mail-101"]').trigger("contextmenu");
      cy.get('[data-testid="mail-card-mail-102"]').click();

      // Trigger structural execution bar dispatch option
      cy.get('[data-testid="bulk-archive-btn"]').click();

      cy.wait("@putBulkUpdate").then((interception) => {
        const reqBody = interception.request.body;
        expect(reqBody).to.be.an("array").with.lengthOf(2);
        expect(reqBody[0].archive).to.be.true;
        expect(reqBody[1].archive).to.be.true;
      });
    });
  });

  // --- CATEGORY 3: ROUTING & WORKFLOW INTERACTION TRANSITIONS ---
  describe("Screen Navigation Paths & Router Hooks Verification", () => {
    it("should fire router link safe redirections when selecting active card rows", () => {
      cy.get('[data-testid="mail-card-mail-101"]').click();

      cy.url().should("include", "/mailDetail");
      cy.url().should("include", "messageId=mail-101");
    });

    it("should forward parameters cleanly when opening the creation layer interface template", () => {
      cy.get('[data-testid="compose-button"]').click();
      cy.url().should("include", "/compose");
    });
  });
});
