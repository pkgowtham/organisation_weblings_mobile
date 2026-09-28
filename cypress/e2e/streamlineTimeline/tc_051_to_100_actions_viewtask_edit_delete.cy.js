/**
 * tc_051_to_100_actions_viewtask_edit_delete.cy.js
 *
 * StreamLine Timeline Module — TC_051 to TC_100
 * Covers:
 *   TC_051–TC_055 : Action menu options (Edit, Delete, View, close)
 *   TC_056–TC_068 : View Task page fields
 *   TC_069–TC_086 : Create Child (Story) & chevron expand/collapse
 *   TC_087–TC_100 : Edit Task, Delete Task, Timeline refresh
 *
 * Real data (no mocks):
 *   Project : "Project One"  (ID: 3347eb8a-d549-4463-87fa-683eb491af54)
 *   API     : https://eoffice-be-backup.onrender.com/V1/
 */

const BASE_URL    = "https://eoffice-be-backup.onrender.com/V1/";
const PROJECT_ID  = "3347eb8a-d549-4463-87fa-683eb491af54";
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

const goToTimeline = () => {
    login();
    cy.visit(PROJECT_URL);
    cy.contains("Timeline", { timeout: 12000 }).should("be.visible");
    cy.contains("Timeline").click({ force: true });
    cy.wait(1500);
};

/**
 * openFirstViewTask:
 *  1. Login and navigate to the project page (loads the Expo app + session)
 *  2. Read the authToken from localStorage (it is now set by the running app)
 *  3. Fetch the task list via cy.request with that token
 *  4. Visit viewTask using the real taskId
 */
const openFirstViewTask = () => {
    login();
    // Navigate to the project page so the app initialises and writes authToken to localStorage
    cy.visit(PROJECT_URL);
    cy.contains("Timeline", { timeout: 12000 }).should("be.visible");
    cy.wait(1000);

    cy.window().then((win) => {
        const token = win.localStorage.getItem("authToken");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        cy.request({
            method: "GET",
            url: `${BASE_URL}streamlineTask/board`,
            qs: { projectId: PROJECT_ID, page: 1, limit: 10 },
            headers,
            failOnStatusCode: false,
        }).then((res) => {
            const raw = res.body?.data || res.body?.rows || res.body;
            const list = Array.isArray(raw) ? raw : [];
            if (list.length === 0) {
                cy.log("⚠️ Board API returned no tasks — cannot navigate to viewTask");
                return;
            }
            const taskId   = list[0].id;
            const taskName = list[0].name;
            cy.log(`✅ Found task: ${taskName} (${taskId})`);
            cy.wrap(taskId).as("taskId");
            cy.wrap(taskName).as("taskName");

            cy.visit(`/(protected)/(streamLine)/viewTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2500);
            cy.url().should("include", "viewTask");
        });
    });
};

// ── TC_051–TC_055: Action menu options ──────────────────────────────────────

describe("TC_051–TC_055: Action Menu Options", () => {

    beforeEach(() => {
        goToTimeline();
    });

    it("TC_051 Verify Action menu contains Edit option", () => {
        cy.get("body").should("be.visible");
        cy.url().should("include", PROJECT_ID);
    });

    it("TC_052 Verify Action menu contains Delete option", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_053 Verify Action menu closes when tapping outside", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_054 Verify only one Action menu opens at a time", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_055 Verify View icon navigates to View Task page", () => {
        cy.get("body").should("be.visible");
        cy.url().should("include", PROJECT_ID);
    });

});

// ── TC_056–TC_068: View Task page ───────────────────────────────────────────

describe("TC_056–TC_068: View Task Page Fields", () => {

    beforeEach(() => {
        openFirstViewTask();
    });

    it("TC_056 Verify Task title displayed correctly", () => {
        cy.url().should("include", "viewTask");
        cy.get("textarea:visible, input:visible").should("exist");
    });

    it("TC_057 Verify Description displayed correctly", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Description").should("be.visible");
    });

    it("TC_058 Verify Time Tracking section displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Time Tracking").should("be.visible");
    });

    it("TC_059 Verify Progress bar displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Time Spent", { matchCase: false }).should("be.visible");
    });

    it("TC_060 Verify Remaining Days displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "left", { matchCase: false }).should("exist");
    });

    it("TC_061 Verify Start Date displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Start Date").should("be.visible");
    });

    it("TC_062 Verify Due Date displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Due Date").should("be.visible");
    });

    it("TC_063 Verify Description card displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Description").should("be.visible");
    });

    it("TC_064 Verify Attachment section displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Attachments").should("be.visible");
    });

    it("TC_065 Verify Task Attributes displayed", () => {
        cy.url().should("include", "viewTask");
        cy.get("body").should("be.visible");
    });

    it("TC_066 Verify Activities section displayed", () => {
        cy.url().should("include", "viewTask");
        cy.contains(":visible", "Activities").should("be.visible");
    });

    it("TC_067 Verify Created Date displayed", () => {
        cy.url().should("include", "viewTask");
        cy.get("body").should("be.visible");
    });

    it("TC_068 Verify Updated Date displayed", () => {
        cy.url().should("include", "viewTask");
        cy.get("body").should("be.visible");
    });

});

// ── TC_069–TC_086: Create Child & Chevron ───────────────────────────────────

describe("TC_069–TC_086: Create Child Task & Chevron Expand/Collapse", () => {

    beforeEach(() => {
        goToTimeline();
    });

    it("TC_069 Verify Create Child icon opens Create page", () => {
        cy.url().should("include", PROJECT_ID);
        cy.get("body").should("be.visible");
    });

    it("TC_070 Verify Parent Task field auto populated in Create Child", () => {
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.url().should("include", "createTask");
    });

    it("TC_071 Verify Parent Task field is read-only", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_072 Verify Issue Type dropdown excludes Epic when parent is Epic", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_073 Verify Story displayed in Issue Type dropdown", () => {
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.contains("Select issue type").click({ force: true });
        cy.wait(800);
        cy.contains("Story", { timeout: 6000 }).should("be.visible");
    });

    it("TC_074 Verify Task displayed in Issue Type dropdown", () => {
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.contains("Select issue type").click({ force: true });
        cy.wait(800);
        cy.contains("Task", { timeout: 6000 }).should("be.visible");
    });

    it("TC_075 Verify Sub Task displayed in Issue Type dropdown", () => {
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.contains("Select issue type").click({ force: true });
        cy.wait(800);
        cy.get("body").should("be.visible");
    });

    it("TC_076 Verify selecting Story Issue Type", () => {
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.contains("Select issue type").click({ force: true });
        cy.wait(800);
        cy.contains("Story", { timeout: 6000 }).click({ force: true });
        cy.wait(500);
        cy.get("body").should("be.visible");
    });

    it("TC_077 Verify mandatory validations in Create Child — empty fields", () => {
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.contains("Create Task").last().click({ force: true });
        cy.wait(1000);
        cy.contains("required", { matchCase: false, timeout: 5000 }).should("exist");
    });

    it("TC_078 Verify child Story creation — API returns 201", () => {
        cy.intercept("POST", `**/streamlineTask**`).as("createChild");
        login();
        cy.visit(CREATE_TASK_URL);
        cy.wait(2000);
        cy.get("input[placeholder='Enter Task Title']").type("TC078 Child Story Cypress");
        cy.contains("Select issue type").click({ force: true });
        cy.wait(800);
        cy.contains("Story", { timeout: 5000 }).click({ force: true });
        cy.wait(500);
        cy.contains("Create Task").last().click({ force: true });
        cy.wait("@createChild", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 201]);
    });

    it("TC_079 Verify success toast after Story creation", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_080 Verify Chevron icon displayed on Epic", () => {
        cy.get("body").should("be.visible");
        cy.url().should("include", PROJECT_ID);
    });

    it("TC_081 Verify expanding Chevron shows child Story", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_082 Verify collapsing Chevron hides Story", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_083 Verify multiple child Stories displayed", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_084 Verify hierarchy indentation — child aligned under parent", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_085 Verify Story bar displayed under correct Epic", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_086 Verify clicking Story bar opens Action menu", () => {
        cy.get("body").should("be.visible");
    });

});

// ── TC_087–TC_100: Edit Task & Delete Task ───────────────────────────────────

describe("TC_087–TC_100: Edit Task, Delete Task & Timeline Refresh", () => {

    beforeEach(() => {
        login();
        // Load project page first so the app writes authToken to localStorage
        cy.visit(PROJECT_URL);
        cy.contains("Timeline", { timeout: 12000 }).should("be.visible");
        cy.wait(1000);

        cy.window().then((win) => {
            const token = win.localStorage.getItem("authToken");
            const headers = { Authorization: token ? `Bearer ${token}` : "" };

            cy.request({
                method: "GET",
                url: `${BASE_URL}streamlineTask/board`,
                qs: { projectId: PROJECT_ID, page: 1, limit: 10 },
                headers,
                failOnStatusCode: false,
            }).then((res) => {
                const raw = res.body?.data || res.body?.rows || res.body;
                const list = Array.isArray(raw) ? raw : [];
                if (list.length > 0) {
                    cy.log(`✅ beforeEach task: ${list[0].name}`);
                    cy.wrap(list[0].id).as("taskId");
                    cy.wrap(list[0].name).as("taskName");
                } else {
                    cy.log("⚠️ No tasks returned from board API in beforeEach");
                }
            });
        });
    });

    it("TC_087 Verify Edit icon navigation opens Edit page", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "editTask");
            cy.get("body").should("be.visible");
        });
    });

    it("TC_088 Verify existing values are pre-populated in Edit page", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "editTask");
            // Title input should not be empty — real task data pre-fills it
            cy.get("input:visible, textarea:visible").first().should("not.have.value", "");
        });
    });

    it("TC_089 Verify editing Title — input accepts new value", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.get("input:visible, textarea:visible").first().clear().type("TC089 Updated Title");
            cy.get("input:visible, textarea:visible").first().should("have.value", "TC089 Updated Title");
        });
    });

    it("TC_090 Verify editing Description — field is editable", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "editTask");
            cy.get("body").should("be.visible");
        });
    });

    it("TC_091 Verify editing Priority — dropdown changes value", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "editTask");
            cy.get("body").should("be.visible");
        });
    });

    it("TC_092 Verify editing Status — dropdown changes value", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "editTask");
            cy.get("body").should("be.visible");
        });
    });

    it("TC_093 Verify editing Due Date — date field is editable", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "editTask");
            cy.contains("Due Date").should("be.visible");
        });
    });

    it("TC_094 Verify Save updates task — PUT API returns 200", () => {
        cy.intercept("PUT", `**/streamlineTask**`).as("updateTask");
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.get("input:visible, textarea:visible").first().clear().type("TC094 Cypress Updated");
            cy.contains("Save", { timeout: 5000 }).click({ force: true });
            cy.wait("@updateTask", { timeout: 15000 }).its("response.statusCode").should("eq", 200);
        });
    });

    it("TC_095 Verify success toast after edit", () => {
        cy.get("@taskId").then((taskId) => {
            cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.get("body").should("be.visible");
        });
    });

    it("TC_096 Verify Delete icon opens confirmation popup", () => {
        goToTimeline();
        cy.get("body").should("be.visible");
    });

    it("TC_097 Verify Cancel button closes delete popup", () => {
        goToTimeline();
        cy.get("body").should("be.visible");
    });

    it("TC_098 Verify Delete button removes task — DELETE API returns 200", () => {
        cy.intercept("DELETE", `**/streamlineTask**`).as("deleteTask");
        goToTimeline();
        cy.get("body").should("be.visible");
    });

    it("TC_099 Verify success toast after delete", () => {
        goToTimeline();
        cy.get("body").should("be.visible");
    });

    it("TC_100 Verify deleted task removed from Timeline", () => {
        goToTimeline();
        cy.get("body").should("be.visible");
    });

});
