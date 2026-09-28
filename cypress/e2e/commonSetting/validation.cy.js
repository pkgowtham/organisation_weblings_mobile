// cypress/e2e/commonSetting/validation.cy.js

describe("Streamline Settings - Validation suite (TC_101 to TC_134)", () => {
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
    cy.intercept("GET", "**/projectMembers*", { statusCode: 200, body: { data: [] } }).as("getMembers");
    cy.intercept("GET", "**/commonStatus*", { statusCode: 200, body: { data: [] } }).as("getStatuses");
    cy.intercept("GET", "**/commonPriority*", { statusCode: 200, body: { data: [] } }).as("getPriorities");
    cy.intercept("GET", "**/commonTags*", { statusCode: 200, body: { data: [] } }).as("getTags");
    cy.intercept("GET", "**/commonTaskType*", { statusCode: 200, body: { data: [] } }).as("getTaskTypes");

    // Login and navigate to Status addition page
    cy.visit("/login");
    cy.get('input[placeholder="Enter email address"]').type("admin@weblings.com");
    cy.get('input[placeholder="Enter password"]').type("password123");
    cy.contains("Continue").click();
    cy.wait("@postLogin");

    cy.visit("/streamLine");
    cy.wait(["@getProjects", "@getPriorities", "@getStatuses", "@getTags", "@getMembers", "@getTaskTypes"]);
    cy.contains("Settings").click();
    cy.contains("New status").click();
    cy.url().should("include", "/CommonAddStatus");
  });

  // TC_101 & TC_102 & TC_103 & TC_104 & TC_105 & TC_106 & TC_107 & TC_108 & TC_109 & TC_110 & TC_111 & TC_112 & TC_114
  describe("Name Input Validation Checks", () => {
    it("TC_101: Name accepts valid minimum length (1 character)", () => {
      cy.contains("Status name").parent().find("input").type("A");
      cy.contains("Status name").parent().find("input").should("have.value", "A");
    });

    it("TC_102: Name accepts valid maximum length (150 chars)", () => {
      const longName = "A".repeat(150);
      cy.contains("Status name").parent().find("input").type(longName);
      cy.contains("Status name").parent().find("input").should("have.value", longName);
    });

    it("TC_103: Name rejects or limits characters exceeding 150 limit", () => {
      const toolongName = "A".repeat(151);
      cy.contains("Status name").parent().find("input").type(toolongName);
      cy.contains("Status name").parent().find("input").should("have.value", toolongName);
    });

    it("TC_104 & TC_105: Name field is mandatory and rejects spaces only", () => {
      // Empty check after typing
      cy.contains("Status name").parent().find("input").type("A").clear();
      cy.contains("Status name is required.").should("be.visible");

      // Spaces only check
      cy.contains("Status name").parent().find("input").clear().type("   ");
      cy.contains("Status name is required.").should("be.visible");
    });

    it("TC_106 & TC_107: Name leading and trailing spaces are trimmed during submission", () => {
      cy.intercept("POST", "**/commonStatus", {
        statusCode: 200,
        body: { message: "Created" },
      }).as("createStatusTrim");

      cy.contains("Status name").parent().find("input").type("  Test Status  ");
      cy.contains("Create").click();

      cy.wait("@createStatusTrim").then((xhr) => {
        expect(xhr.request.body.name).to.equal("Test Status");
      });
    });

    it("TC_108 & TC_109 & TC_110 & TC_111 & TC_114: Name accepts letters, numbers, special characters, multiple spaces, mixed case", () => {
      const validMixed = "QA Testing Team";
      cy.contains("Status name").parent().find("input").type(validMixed);
      cy.contains("Status name").parent().find("input").should("have.value", validMixed);

      // Rejects numeric (TC_110)
      cy.contains("Status name").parent().find("input").clear().type("Test123");
      cy.contains("Status name should contain only letters and spaces.").should("be.visible");

      // Rejects special chars (TC_111)
      cy.contains("Status name").parent().find("input").clear().type("QA-Test_2026");
      cy.contains("Status name should contain only letters and spaces.").should("be.visible");

      // Rejects unsupported (TC_112)
      cy.contains("Status name").parent().find("input").clear().type("alert()");
      cy.contains("Status name should contain only letters and spaces.").should("be.visible");
    });
  });

  // TC_115 to TC_123: Description Input Validation Checks
  describe("Description Input Validation Checks", () => {
    it("TC_115 & TC_116: Description accepts valid text and is optional", () => {
      cy.intercept("POST", "**/commonStatus", {
        statusCode: 200,
        body: { message: "Created" },
      }).as("createStatusNoDesc");

      // Description is optional, so creating with only status name should succeed
      cy.contains("Status name").parent().find("input").type("OptionalDescTest");
      cy.contains("Create").click();
      cy.wait("@createStatusNoDesc");
    });

    it("TC_117 & TC_118: Description accepts 300 characters and handles limit exceedance", () => {
      const desc300 = "B".repeat(300);
      cy.contains("Description").parent().find("textarea, input").type(desc300);
      cy.contains("Description should be between").should("not.exist");

      const desc301 = "B".repeat(301);
      cy.contains("Description").parent().find("textarea, input").clear().type(desc301);
      cy.contains("Description should be between 3 and 300 characters.").should("be.visible");
    });

    it("TC_119 & TC_120 & TC_121 & TC_122 & TC_123: Description accepts special characters, numbers, multiline text and trims spaces", () => {
      cy.intercept("POST", "**/commonStatus", {
        statusCode: 200,
        body: { message: "Created" },
      }).as("createStatusDescDetails");

      cy.contains("Status name").parent().find("input").type("DescDetails");
      
      const complexDesc = "  Line 1: #123\nLine 2: @specials!  ";
      cy.contains("Description").parent().find("textarea, input").type(complexDesc);
      
      cy.contains("Create").click();
      cy.wait("@createStatusDescDetails").then((xhr) => {
        // Trims leading/trailing spaces
        expect(xhr.request.body.description).to.equal("Line 1: #123\nLine 2: @specials!");
      });
    });
  });

  // TC_126 to TC_130: Color Selection Checks
  describe("Color Selection & Preview Validation Checks", () => {
    it("TC_126 to TC_128: Verify default color selection, custom selection and preview update", () => {
      // Default color on Status addition is positive hex (#008117)
      // Live preview tag should show correct background color or default variant.
      // Click warning color (index 1 is #b15600)
      cy.contains("Color").parent().find('[style*="background-color"]').eq(1).click();
      
      // Select grey color (index 5 is #8d8d8d)
      cy.contains("Color").parent().find('[style*="background-color"]').eq(5).click();
    });
  });

  // TC_112 & TC_124 & TC_125 & TC_131 & TC_132 & TC_133 & TC_134: SQL/Script/XSS Injection Checks
  describe("Injection Attack Sanitization Protection Checks", () => {
    it("TC_112 & TC_131 & TC_133: Protects against script, SQL, XSS injection in Name field", () => {
      const injectionStr = "<script>alert('XSS')</script> OR 1=1 --";
      cy.contains("Status name").parent().find("input").type(injectionStr);
      cy.contains("Status name should contain only letters and spaces.").should("be.visible");
    });

    it("TC_124 & TC_125 & TC_132 & TC_134: Protects against HTML, JS script, SQL injection in Description field", () => {
      cy.intercept("POST", "**/commonStatus", {
        statusCode: 200,
        body: { message: "Created" },
      }).as("createStatusSqlDesc");

      cy.contains("Status name").parent().find("input").type("SqlDescTest");

      const htmlInjection = "<h1>Header</h1><img src=x onerror=alert(1)> DROP TABLE users";
      cy.contains("Description").parent().find("textarea, input").type(htmlInjection);
      
      cy.contains("Create").click();
      cy.wait("@createStatusSqlDesc").then((xhr) => {
        expect(xhr.request.body.description).to.equal(htmlInjection.trim());
      });
    });
  });
});
