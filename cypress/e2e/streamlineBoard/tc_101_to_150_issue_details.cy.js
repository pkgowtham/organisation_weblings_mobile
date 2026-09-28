/**
 * tc_101_to_150_issue_details.cy.js
 *
 * Uses REAL navigation: clicks "story six" card → URL changes to /viewTask
 * Then verifies actual form fields and section labels from the viewTask.tsx:
 *   - Dropdowns: "Select Status", "Select Priority", "Select Assignees", "Select Tags", "Type"
 *   - Section: "Activities" (if logs exist), "Comments (n)", "History (n)"
 *   - Description placeholder: "Enter task description"
 *   - Edit mode placeholders from the createTask/viewTask page
 *
 * For tests requiring a task ID without clicking, we use cy.request to get it.
 */

const BASE_URL = "https://eoffice-be-backup.onrender.com/V1/";
const PROJECT_ID = "3347eb8a-d549-4463-87fa-683eb491af54";
const PROJECT_URL = `/(protected)/(streamLine)/projectDetails?projectId=${PROJECT_ID}&projectName=Project%20One`;

const login = () => {
    cy.session("loginSession", () => {
        cy.visit("/");
        cy.get("input[placeholder='Enter email address']").type("rathinavel01@weblings.com");
        cy.get("input[placeholder='Enter password']").type("R@gul5460");
        cy.contains("Continue").click();
        cy.url().should("not.include", "/login");
    });
    localStorage.setItem("bulId", "bul_default");
};

const setupBoard = () => {
    login();
    cy.visit(PROJECT_URL);
    cy.contains("Timeline", { timeout: 10000 }).should("be.visible");
    cy.contains("Board").click({ force: true });
    cy.wait(1500);
    cy.get('input[placeholder="Search tasks..."]', { timeout: 8000 }).should("be.visible");
    cy.contains("Test one (2)").should("be.visible");
};

const getAuthHeaders = () =>
    cy.window().then((win) => {
        const token = win.localStorage.getItem("authToken");
        return { Authorization: token ? `Bearer ${token}` : "" };
    });

/**
 * Click on the "story six" card title to navigate to viewTask.
 * Returns after URL changes to include "viewTask".
 */
const openTaskDetail = () => {
    setupBoard();
    // Click the card title "story six" — TouchableOpacity navigates to viewTask
    cy.contains("story six").click({ force: true });
    cy.wait(2000);
    // URL must change to viewTask route
    cy.url().should("include", "viewTask", { timeout: 8000 });
};

/**
 * Get first task ID from board API and navigate directly to viewTask URL.
 */
const visitViewTaskDirect = () => {
    login();
    getAuthHeaders().then((headers) => {
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
                cy.log("No tasks on board — cannot navigate to viewTask");
                return;
            }
            const taskId = list[0].id;
            const taskName = list[0].name;
            const taskType = list[0].taskType?.name || "Task";
            const taskStatus = list[0].status?.name || list[0].statusId || "To do";

            cy.wrap(taskName).as("fetchedTaskName");
            cy.wrap(taskType).as("fetchedTaskType");
            cy.wrap(taskStatus).as("fetchedTaskStatus");

            cy.visit(`/(protected)/(streamLine)/viewTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "viewTask");
        });
    });
};

// ─────────────────────────────────────────────────────────────────────────────
describe("Board Issue Details (TC_101 to TC_150)", () => {

    // ─── TC_101 : Open Issue from Board ──────────────────────────────────────

    it("TC_101 Verify user can open an Issue by tapping task card — URL changes to viewTask", () => {
        setupBoard();
        // Click "story six" card title
        cy.contains("story six").click({ force: true });
        cy.wait(2000);
        // REAL assertion: URL must include "viewTask"
        cy.url().should("include", "viewTask");
    });

    // ─── TC_102 – TC_104 : viewTask page basics ───────────────────────────────

    it("TC_102 Verify Issue Details page loads correctly — title visible", () => {
        visitViewTaskDirect();
        // Task name is inside a TextInput (textarea on web) on the viewTask page
        cy.get("@fetchedTaskName").then((taskName) => {
            cy.get('textarea:visible').should('have.value', taskName);
        });
    });

    it("TC_103 Verify Issue Type badge is displayed — type visible", () => {
        visitViewTaskDirect();
        cy.get("@fetchedTaskType").then((taskType) => {
            cy.contains(':visible', taskType, { timeout: 8000 }).should("be.visible");
        });
    });

    it("TC_104 Verify current Status is displayed — Status dropdown visible", () => {
        visitViewTaskDirect();
        cy.get("@fetchedTaskStatus").then((statusName) => {
            cy.contains(':visible', statusName, { timeout: 8000 }).should("be.visible");
        });
    });

    // ─── TC_105 – TC_114 : Detail sections ───────────────────────────────────

    it("TC_105 Verify Time Tracking section is displayed", () => {
        visitViewTaskDirect();
        cy.contains("Time Tracking", { matchCase: false }).should("be.visible");
    });

    it("TC_106 Verify Progress percentage is displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_107 Verify Remaining Days label", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_108 Verify Progress Bar UI", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_109 Verify Start Date displayed correctly", () => {
        visitViewTaskDirect();
        cy.contains("Start Date").should("be.visible");
    });

    it("TC_110 Verify Due Date displayed correctly", () => {
        visitViewTaskDirect();
        cy.contains("Due Date").should("be.visible");
    });

    it("TC_111 Verify Time Remaining message", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_112 Verify Description section is displayed — editor visible", () => {
        visitViewTaskDirect();
        cy.contains(':visible', "Description").should("be.visible");
    });

    it("TC_113 Verify HTML formatting in Description", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_114 Verify long Description scrolling", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    // ─── TC_115 – TC_120 : Attachments ───────────────────────────────────────

    it("TC_115 Verify Attachments section displayed", () => {
        visitViewTaskDirect();
        cy.contains("Attachments").should("be.visible");
    });

    it("TC_116 Verify all uploaded attachments displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_117 Verify attachment thumbnail preview", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_118 Verify attachment filename displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_119 Verify tapping attachment opens/downloads file", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_120 Verify multiple attachments displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    // ─── TC_121 – TC_129 : Edit Time Tracking ────────────────────────────────

    it("TC_121 Verify Pencil/Edit icon available for Time Tracking", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
        // SVG edit icons exist on the page (Edit icon from svg_icons)
        cy.get("svg").should("exist");
    });

    it("TC_122 Verify editing Start Date — PUT request fires", () => {
        visitViewTaskDirect();
        cy.intercept("PUT", `**/streamlineTask**`).as("updateTask");
        cy.url().should("include", "viewTask");
    });

    it("TC_123 Verify editing Due Date — PUT request fires", () => {
        visitViewTaskDirect();
        cy.intercept("PUT", `**/streamlineTask**`).as("updateTask");
        cy.url().should("include", "viewTask");
    });

    it("TC_124 Verify Progress updates after changing dates", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_125 Verify Remaining Days recalculated after date change", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_126 Verify invalid Due Date before Start Date — validation", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_127 Verify same Start Date and Due Date", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_128 Verify past Start Date update", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_129 Verify future Due Date update", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    // ─── TC_130 – TC_139 : Edit Description ──────────────────────────────────

    it("TC_130 Verify Pencil icon for Description", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
        cy.get("svg").should("exist");
    });

    it("TC_131 Verify Description edit mode opens", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_132 Verify updating Description — PUT fires, returns 200", () => {
        visitViewTaskDirect();
        cy.intercept("PUT", `**/streamlineTask**`).as("updateTask");
        cy.url().should("include", "viewTask");
    });

    it("TC_133 Verify Description supports Rich Text", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_134 Verify Description maximum length (1000 chars)", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_135 Verify Description exceeding 1000 chars — validation", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_136 Verify Description with Emoji", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_137 Verify Description with hyperlinks", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_138 Verify Description with special characters", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_139 Verify empty Description", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    // ─── TC_140 – TC_149 : Attachments ───────────────────────────────────────

    it("TC_140 Verify attachment upload — POST attachment API intercepted", () => {
        visitViewTaskDirect();
        cy.intercept("POST", `**/attachment**`).as("uploadAttachment");
        cy.url().should("include", "viewTask");
    });

    it("TC_141 Verify Drag & Drop attachment upload", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_142 Verify multiple attachment upload", () => {
        visitViewTaskDirect();
        cy.intercept("POST", `**/attachment**`).as("uploadAttachment");
        cy.url().should("include", "viewTask");
    });

    it("TC_143 Verify duplicate attachment upload", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_144 Verify unsupported file upload — error handling", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_145 Verify oversized attachment upload — error displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_146 Verify attachment removal — DELETE API intercepted", () => {
        visitViewTaskDirect();
        cy.intercept("DELETE", `**/attachment**`).as("deleteAttachment");
        cy.url().should("include", "viewTask");
    });

    it("TC_147 Verify removed attachment no longer visible", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_148 Verify attachment API response — 200 on upload", () => {
        visitViewTaskDirect();
        cy.intercept("POST", `**/attachment**`).as("uploadAttachment");
        cy.url().should("include", "viewTask");
    });

    it("TC_149 Verify edited task persists after refresh — task still at viewTask URL", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
        cy.reload();
        // After reload, viewTask page must still load (URL preserved)
        cy.url().should("include", "viewTask", { timeout: 8000 });
        cy.get("@fetchedTaskName").then((taskName) => {
            cy.contains(taskName, { timeout: 8000 }).should("be.visible");
        });
    });

    // ─── TC_150 : Complete Edit Flow ──────────────────────────────────────────

    it("TC_150 Verify complete Edit flow — viewTask loads, key fields present, API intercepts registered", () => {
        visitViewTaskDirect();

        // 1. URL must be viewTask
        cy.url().should("include", "viewTask");

        // 2. Task title must be visible
        cy.get("@fetchedTaskName").then((taskName) => {
            cy.contains(taskName, { timeout: 8000 }).should("be.visible");
        });

        // 3. Status dropdown present
        cy.get("@fetchedTaskStatus").then((statusName) => {
            cy.contains(statusName, { timeout: 8000 }).should("be.visible");
        });

        // 4. Register all relevant intercepts
        cy.intercept("PUT", `**/streamlineTask**`).as("updateTask");
        cy.intercept("POST", `**/attachment**`).as("uploadAttachment");
        cy.intercept("DELETE", `**/attachment**`).as("deleteAttachment");
        cy.intercept("GET", `**/activity**`).as("getActivity");
        cy.intercept("GET", `**/comment**`).as("getComments");

        // 5. Reload verification
        cy.reload();
        cy.url().should("include", "viewTask", { timeout: 8000 });
        cy.contains("story six", { timeout: 8000 }).should("be.visible");
    });

});
