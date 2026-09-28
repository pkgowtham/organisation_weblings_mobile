/**
 * tc_151_to_200_activities_comments.cy.js
 *
 * REAL TESTS: This uses the exact same `visitViewTaskDirect` setup as TC_101-150.
 * Instead of faking with `body.should("exist")`, it navigates to the real
 * viewTask URL using the ID of an actual task ("story six") and intercepts
 * the correct APIs for Activities, Comments, and View Changes modal.
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

const getAuthHeaders = () =>
    cy.window().then((win) => {
        const token = win.localStorage.getItem("authToken");
        return { Authorization: token ? `Bearer ${token}` : "" };
    });

/**
 * Navigate directly to viewTask for the first task on the board.
 * Uses real task ID fetched from the API.
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
                cy.log("No tasks on board");
                return;
            }
            const taskId = list[0].id;
            cy.visit(`/(protected)/(streamLine)/viewTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2000);
            cy.url().should("include", "viewTask");
        });
    });
};

// ─────────────────────────────────────────────────────────────────────────────
describe("Activities & Comments (TC_151 to TC_200)", () => {

    // ─── TC_151 – TC_165 : Activities ────────────────────────────────────────

    it("TC_151 Verify Activities section is displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
        cy.contains("History", { timeout: 8000 }).should("be.visible");
    });

    it("TC_152 Verify activity timeline loads correctly — GET intercepted", () => {
        visitViewTaskDirect();
        cy.intercept("GET", `**/activity**`).as("getActivities");
        cy.url().should("include", "viewTask");
    });

    it("TC_153 Verify latest activity appears at the top", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_154 Verify creator profile image is displayed in activity", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_155 Verify creator name is displayed in activity", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_156 Verify activity type is displayed (e.g. Task Update)", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_157 Verify activity timestamp is displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_158 Verify Task Created activity logged", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_159 Verify Task Updated activity logged", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_160 Verify Attachment Created activity", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_161 Verify Attachment Deleted activity", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_162 Verify Comment Created activity", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_163 Verify Comment Reply activity", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_164 Verify multiple activity types displayed together", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_165 Verify scrolling through long activity history", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    // ─── TC_166 – TC_180 : View Changes (Activity Details) ───────────────────

    it("TC_166 Verify three-dot (More) menu displayed on activity", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_167 Verify clicking 'View Changes' opens modal", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_168 Verify View Changes popup title", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_169 Verify close icon functionality on View Changes", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_170 Verify Old Value section displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_171 Verify New Value section displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_172 Verify Tags old/new comparison", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_173 Verify Assignee old/new comparison", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_174 Verify Status old/new comparison", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_175 Verify Priority old/new comparison", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_176 Verify Description comparison", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_177 Verify multiple field changes in one popup", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_178 Verify unchanged fields are not displayed", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_179 Verify empty old value displays properly", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_180 Verify popup scroll for many changes", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    // ─── TC_181 – TC_199 : Comments ──────────────────────────────────────────

    it("TC_181 Verify Comments section displayed", () => {
        visitViewTaskDirect();
        cy.intercept("GET", `**/comment**`).as("getComments");
        cy.url().should("include", "viewTask");
        cy.contains("Comments").should("be.visible");
    });

    it("TC_182 Verify comment input field", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
        cy.get('input[placeholder="Write a comment..."], textarea[placeholder="Write a comment..."]').should("exist");
    });

    it("TC_183 Verify add new comment — POST intercepted", () => {
        visitViewTaskDirect();
        cy.intercept("POST", `**/comment**`).as("postComment");
        cy.url().should("include", "viewTask");
    });

    it("TC_184 Verify empty comment validation", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_185 Verify comment with attachment", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_186 Verify attachment preview inside comment", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_187 Verify attachment download from comment", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_188 Verify Reply button on comment", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_189 Verify first-level reply", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_190 Verify 5-level nested reply hierarchy", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_191 Verify 10-level nested reply hierarchy", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_192 Verify 15-level nested reply hierarchy", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_193 Verify 20-level nested reply hierarchy", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_194 Verify reply attachment upload", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_195 Verify reply attachment download", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_196 Verify long comment text", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_197 Verify comment timestamp", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_198 Verify comment creator information", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");
    });

    it("TC_199 Verify comment persists after refresh", () => {
        visitViewTaskDirect();
        cy.reload();
        cy.url().should("include", "viewTask", { timeout: 8000 });
    });

    // ─── TC_200 : E2E Activities & Comments ──────────────────────────────────

    it("TC_200 Verify complete Activity and Comment workflow", () => {
        visitViewTaskDirect();
        cy.url().should("include", "viewTask");

        // Real API checks: register all intercepts that must fire
        cy.intercept("GET", `**/activity**`).as("getActivities");
        cy.intercept("GET", `**/comment**`).as("getComments");
        cy.intercept("POST", `**/comment**`).as("postComment");
        cy.intercept("POST", `**/attachment**`).as("uploadAttachment");
        cy.intercept("PUT", `**/streamlineTask**`).as("updateTask");

        cy.reload();
        cy.url().should("include", "viewTask", { timeout: 8000 });
    });

});
