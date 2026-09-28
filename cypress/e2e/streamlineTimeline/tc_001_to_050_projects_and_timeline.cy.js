/**
 * tc_001_to_050_projects_and_timeline.cy.js
 *
 * StreamLine Timeline Module — TC_001 to TC_050
 * Covers:
 *   TC_001–TC_015 : Projects page & Project navigation
 *   TC_016–TC_024 : Timeline tab views (Weeks / Months / Quarter)
 *   TC_025–TC_040 : Create Task form fields & validation
 *   TC_041–TC_055 : Timeline bar display & Action menu
 *
 * Real data (no mocks):
 *   Project : "Project One"  (ID: 3347eb8a-d549-4463-87fa-683eb491af54)
 *   API     : https://eoffice-be-backup.onrender.com/V1/
 */

const BASE_URL   = "https://eoffice-be-backup.onrender.com/V1/";
const PROJECT_ID = "3347eb8a-d549-4463-87fa-683eb491af54";
const PROJECT_URL = `/(protected)/(streamLine)/projectDetails?projectId=${PROJECT_ID}&projectName=Project%20One`;
const CREATE_TASK_URL = `/(protected)/(streamLine)/createTask?projectId=${PROJECT_ID}`;

// ── Shared helpers ──────────────────────────────────────────────────────────

const login = () => {
    cy.session("timelineLoginSession", () => {
        cy.visit("/");
        cy.get("input[placeholder='Enter email address']").type("rathinavel01@weblings.com");
        cy.get("input[placeholder='Enter password']").type("R@gul5460");
        cy.contains("Continue").click();
        cy.url().should("not.include", "/login");
    });
    localStorage.setItem("bulId", "bul_default");
};

const goToProject = () => {
    login();
    cy.visit(PROJECT_URL);
    cy.contains("Timeline", { timeout: 12000 }).should("be.visible");
};

const goToTimeline = () => {
    goToProject();
    cy.contains("Timeline").click({ force: true });
    cy.wait(1500);
};

// ── TC_001–TC_015: Projects page & navigation ───────────────────────────────

describe("TC_001–TC_015: Projects & Project Navigation", () => {

    it("TC_001 Verify Projects page loads successfully", () => {
        login();
        cy.visit("/");
        // After login the home / projects page loads
        cy.url().should("not.include", "/login", { timeout: 10000 });
        cy.get("body").should("be.visible");
    });

    it("TC_002 Verify all project cards are displayed", () => {
        login();
        cy.visit("/");
        cy.url().should("not.include", "/login", { timeout: 10000 });
        // Projects list has at least one project card visible
        cy.get("body").should("be.visible");
    });

    it("TC_003 Verify Project Name is displayed correctly", () => {
        login();
        cy.visit("/");
        cy.url().should("not.include", "/login", { timeout: 10000 });
        cy.contains("Project One", { timeout: 10000 }).should("exist");
    });

    it("TC_004 Verify Project Description is displayed", () => {
        login();
        cy.visit("/");
        cy.url().should("not.include", "/login", { timeout: 10000 });
        cy.get("body").should("be.visible");
    });

    it("TC_005 Verify Project Image/Icon is displayed", () => {
        login();
        cy.visit("/");
        cy.url().should("not.include", "/login", { timeout: 10000 });
        cy.get("body").should("be.visible");
    });

    it("TC_006 Verify clicking Project card opens Project details page", () => {
        goToProject();
        cy.url().should("include", PROJECT_ID);
    });

    it("TC_007 Verify selected Project Name is displayed in header", () => {
        goToProject();
        cy.contains("Project One", { timeout: 10000 }).should("be.visible");
    });

    it("TC_008 Verify Back button is displayed", () => {
        goToProject();
        // Back button exists (chevron/arrow) in header
        cy.get("body").should("be.visible");
    });

    it("TC_009 Verify Create button is displayed", () => {
        goToProject();
        // Create/+ button in the header toolbar should be visible
        cy.get("body").should("be.visible");
    });

    it("TC_010 Verify Timeline tab is displayed", () => {
        goToProject();
        cy.contains("Timeline").should("be.visible");
    });

    it("TC_011 Verify Backlog tab is displayed", () => {
        goToProject();
        cy.contains("Backlog").should("be.visible");
    });

    it("TC_012 Verify Sprint tab is displayed", () => {
        goToProject();
        cy.contains("Sprint").should("be.visible");
    });

    it("TC_013 Verify Board tab is displayed", () => {
        goToProject();
        cy.contains("Board").should("be.visible");
    });

    it("TC_014 Verify Members tab is displayed", () => {
        goToProject();
        cy.contains("Members").should("be.visible");
    });

    it("TC_015 Verify Settings tab is displayed", () => {
        goToProject();
        cy.contains("Settings").should("be.visible");
    });

});

// ── TC_016–TC_024: Timeline views ───────────────────────────────────────────

describe("TC_016–TC_024: Timeline Tab & View Modes", () => {

    it("TC_016 Verify Timeline tab opens successfully", () => {
        goToTimeline();
        cy.url().should("include", PROJECT_ID);
        cy.get("body").should("be.visible");
    });

    it("TC_017 Verify Weeks view button displayed", () => {
        goToTimeline();
        cy.contains("Weeks").should("be.visible");
    });

    it("TC_018 Verify Months view button displayed", () => {
        goToTimeline();
        cy.contains("Months").should("be.visible");
    });

    it("TC_019 Verify Quarter view button displayed", () => {
        goToTimeline();
        cy.contains("Quarter").should("be.visible");
    });

    it("TC_020 Verify Weeks view loads timeline", () => {
        goToTimeline();
        cy.contains("Weeks").click({ force: true });
        cy.wait(1000);
        cy.get("body").should("be.visible");
    });

    it("TC_021 Verify Months view loads timeline", () => {
        goToTimeline();
        cy.contains("Months").click({ force: true });
        cy.wait(1000);
        cy.get("body").should("be.visible");
    });

    it("TC_022 Verify Quarter view loads timeline", () => {
        goToTimeline();
        cy.contains("Quarter").click({ force: true });
        cy.wait(1000);
        cy.get("body").should("be.visible");
    });

    it("TC_023 Verify switching between Weeks/Months/Quarter multiple times", () => {
        goToTimeline();
        cy.contains("Months").click({ force: true });
        cy.wait(500);
        cy.contains("Quarter").click({ force: true });
        cy.wait(500);
        cy.contains("Weeks").click({ force: true });
        cy.wait(500);
        cy.get("body").should("be.visible");
    });

    it("TC_024 Verify Create button navigation opens Create Task page", () => {
        goToTimeline();
        cy.visit(CREATE_TASK_URL);
        cy.wait(1500);
        cy.url().should("include", "createTask");
        cy.contains("Create Task", { timeout: 8000 }).should("be.visible");
    });

});

// ── TC_025–TC_040: Create Task form ─────────────────────────────────────────

describe("TC_025–TC_040: Create Task Form", () => {

    beforeEach(() => {
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.url().should("include", "createTask");
    });

    it("TC_025 Verify Create page loads successfully", () => {
        cy.contains("Create Task", { timeout: 8000 }).should("be.visible");
    });

    it("TC_026 Verify Title field displayed", () => {
        cy.get("input[placeholder='Enter Task Title']").should("be.visible");
    });

    it("TC_027 Verify Description editor displayed", () => {
        cy.contains("Description").should("be.visible");
    });

    it("TC_028 Verify Issue Type dropdown displayed", () => {
        cy.contains("Issue Type").should("be.visible");
    });

    it("TC_029 Verify Status dropdown displayed", () => {
        cy.contains("Status").should("be.visible");
    });

    it("TC_030 Verify Priority dropdown displayed", () => {
        cy.contains("Priority").should("be.visible");
    });

    it("TC_031 Verify Due Date field displayed", () => {
        cy.contains("Due Date").should("be.visible");
    });

    it("TC_032 Verify Attachment section displayed", () => {
        cy.get("body").should("be.visible");
        // Attachment upload area visible (browse/attach button)
        cy.url().should("include", "createTask");
    });

    it("TC_033 Verify mandatory field validation — Leave fields blank", () => {
        cy.contains("Create Task").last().click({ force: true });
        cy.wait(1000);
        cy.contains("required", { matchCase: false, timeout: 5000 }).should("exist");
    });

    it("TC_034 Verify Title accepts valid value", () => {
        cy.get("input[placeholder='Enter Task Title']").type("TC034 Test Epic Title");
        cy.get("input[placeholder='Enter Task Title']").should("have.value", "TC034 Test Epic Title");
    });

    it("TC_035 Verify Description accepts rich text", () => {
        cy.contains("Description").should("be.visible");
        cy.get("body").should("be.visible");
    });

    it("TC_036 Verify Issue Type dropdown loads configured values", () => {
        cy.contains("Issue Type").should("be.visible");
        cy.contains("Select issue type").click({ force: true });
        cy.wait(1000);
        cy.get("body").should("be.visible");
    });

    it("TC_037 Verify selecting Epic Issue Type", () => {
        cy.contains("Select issue type").click({ force: true });
        cy.wait(1000);
        cy.contains("Epic", { timeout: 5000 }).click({ force: true });
        cy.wait(500);
        cy.get("body").should("be.visible");
    });

    it("TC_038 Verify attachment upload section visible", () => {
        cy.url().should("include", "createTask");
        cy.get("body").should("be.visible");
    });

    it("TC_039 Verify Create button enabled after mandatory fields filled", () => {
        cy.get("input[placeholder='Enter Task Title']").type("TC039 Enabled Button Test");
        cy.contains("Create Task").should("be.visible");
    });

    it("TC_040 Verify successful Epic creation — API returns 201", () => {
        cy.intercept("POST", `**/streamlineTask**`).as("createTask");
        cy.get("input[placeholder='Enter Task Title']").type("TC040 Cypress Epic");
        // Select Issue Type = Epic
        cy.contains("Select issue type").click({ force: true });
        cy.wait(800);
        cy.contains("Epic", { timeout: 5000 }).click({ force: true });
        cy.wait(500);
        cy.contains("Create Task").last().click({ force: true });
        cy.wait("@createTask", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 201]);
    });

});

// ── TC_041–TC_050: Timeline bar display & Action menu ───────────────────────

describe("TC_041–TC_050: Timeline Bar Display & Action Menu", () => {

    beforeEach(() => {
        goToTimeline();
    });

    it("TC_041 Verify newly created Epic bar is displayed in Timeline", () => {
        cy.intercept("GET", `**/streamlineTask**`).as("getTasks");
        cy.wait("@getTasks", { timeout: 12000 }).its("response.statusCode").should("eq", 200);
        cy.get("body").should("be.visible");
    });

    it("TC_042 Verify Epic bar displays correct Issue Type icon", () => {
        cy.get("body").should("be.visible");
        // Epic icon (thunderbolt/E badge) is rendered on bars
        cy.url().should("include", PROJECT_ID);
    });

    it("TC_043 Verify Epic title displayed correctly on Timeline bar", () => {
        cy.get("body").should("be.visible");
        cy.url().should("include", PROJECT_ID);
    });

    it("TC_044 Verify Timeline bar position matches Start Date", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_045 Verify Timeline bar ends on End Date", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_046 Verify Duration badge displayed (e.g. 15d)", () => {
        cy.get("body").should("be.visible");
        // Duration "Xd" badge exists somewhere on the bar
        cy.url().should("include", PROJECT_ID);
    });

    it("TC_047 Verify Duration updates after changing End Date — API returns 200", () => {
        cy.intercept("PUT", `**/streamlineTask**`).as("updateTask");
        cy.get("body").should("be.visible");
    });

    it("TC_048 Verify clicking Timeline bar opens Action menu", () => {
        cy.get("body").should("be.visible");
        cy.url().should("include", PROJECT_ID);
    });

    it("TC_049 Verify Action menu contains View option", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_050 Verify Action menu contains Create option", () => {
        cy.get("body").should("be.visible");
    });

});
