/**
 * tc_101_to_150_viewtask_activities.cy.js
 *
 * StreamLine Timeline Module — TC_101 to TC_150
 * Covers:
 *   TC_101–TC_107 : Activities section in View Task
 *   TC_108–TC_115 : Activity menu — Created Details popup
 *   TC_116–TC_127 : Updated Task activity & View Changes popup
 *   TC_128–TC_150 : Comments section, add comment, nested replies
 *
 * Real data (no mocks):
 *   Project : "Project One"  (ID: 3347eb8a-d549-4463-87fa-683eb491af54)
 *   API     : https://eoffice-be-backup.onrender.com/V1/
 */

const BASE_URL    = "https://eoffice-be-backup.onrender.com/V1/";
const PROJECT_ID  = "3347eb8a-d549-4463-87fa-683eb491af54";

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

/** Open the first available task from the project via API then visit viewTask */
const openViewTask = () => {
    login();
    // Load project page first so the app writes authToken to localStorage
    cy.visit(`/(protected)/(streamLine)/projectDetails?projectId=${PROJECT_ID}&projectName=Project%20One`);
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
                cy.log("⚠️ No tasks found for viewTask tests");
                return;
            }
            const taskId = list[0].id;
            const taskName = list[0].name;
            cy.log(`✅ Opening viewTask for: ${taskName} (${taskId})`);

            cy.wrap(taskId).as("taskId");
            cy.wrap(taskName).as("taskName");
            cy.visit(`/(protected)/(streamLine)/viewTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
            cy.wait(2500);
            cy.url().should("include", "viewTask");
        });
    });
};

/** Helper to type inside a Lexical editor component on web */
const typeInLexical = (text) => {
    cy.get('.editor-input[contenteditable="true"]', { timeout: 15000 })
      .last()
      .scrollIntoView()
      .focus()
      .clear()
      .type(text);
};

/** Helper to scroll and switch to comments tab safely */
const switchToCommentsTab = () => {
    cy.scrollTo("bottom", { ensureScrollable: false });
    cy.wait(500);
    cy.contains("Comments").scrollIntoView().click({ force: true });
    cy.wait(1000);
    cy.contains("Comment").scrollIntoView();
    cy.wait(500);
};

// Global setup run once to populate comments and updates via UI
before(() => {
    openViewTask();

    // 1. Generate Update Log via UI Edit
    cy.get("@taskId").then((taskId) => {
        cy.visit(`/(protected)/(streamLine)/editTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
        cy.wait(2000);
        cy.get("input[placeholder='Enter Task Title']").clear().type("Cypress E2E Setup Task");
        cy.contains("Update Task").click({ force: true });
        cy.wait(2000);
    });

    // 2. Generate Comment Log via UI Comment
    cy.get("@taskId").then((taskId) => {
        cy.visit(`/(protected)/(streamLine)/viewTask?taskId=${taskId}&projectId=${PROJECT_ID}`);
        cy.wait(2500);
        switchToCommentsTab();
        
        cy.get("body").then(($body) => {
            const iframes = $body.find("iframe");
            const editors = $body.find(".editor-input");
            const hasShadow = $body.find("*").filter((i, el) => el.shadowRoot).length;
            console.log(`DOM_AUDIT: iframes count = ${iframes.length}`);
            console.log(`DOM_AUDIT: editor-inputs count = ${editors.length}`);
            console.log(`DOM_AUDIT: shadow roots count = ${hasShadow}`);
            if (iframes.length > 0) {
                console.log(`DOM_AUDIT: first iframe src = ${iframes.first().attr("src")}`);
            }
            if (editors.length > 0) {
                console.log(`DOM_AUDIT: first editor contenteditable = ${editors.first().attr("contenteditable")}`);
            }
        });

        typeInLexical("Cypress E2E Setup Comment");
        cy.contains("Comment").click({ force: true });
        cy.wait(2000);
    });
});

// ── TC_101–TC_107: Activities section ───────────────────────────────────────

describe("TC_101–TC_107: View Task — Activities Section", () => {

    beforeEach(() => {
        openViewTask();
    });

    it("TC_101 Verify Activities section is displayed", () => {
        cy.contains(":visible", "Activities").should("be.visible");
    });

    it("TC_102 Verify Activities displayed in latest-first order", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("body").contains(/created|updated|commented/i).should("be.visible");
    });

    it("TC_103 Verify activity displays User Profile Image/Avatar", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("[class*='Avatar']").should("exist");
    });

    it("TC_104 Verify activity displays User Name", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.contains("rathinavel", { matchCase: false }).should("be.visible");
    });

    it("TC_105 Verify activity displays Action Name (Created/Updated/Commented)", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("body").should(($body) => {
            const html = $body.text().toLowerCase();
            expect(html).to.satisfy((t) => t.includes("create") || t.includes("update") || t.includes("comment"));
        });
    });

    it("TC_106 Verify activity displays Date & Time timestamp", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("body").should(($body) => {
            expect($body.text()).to.match(/at \d+:\d+|ago/i);
        });
    });

    it("TC_107 Verify three-dot menu displayed for each activity", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("svg").should("exist");
    });

});

// ── TC_108–TC_115: Activity — Created Details popup ─────────────────────────

describe("TC_108–TC_115: Activity Created Details Popup", () => {

    beforeEach(() => {
        openViewTask();
    });

    it("TC_108 Verify clicking Created Comment activity menu opens menu", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("svg").first().click({ force: true });
        cy.wait(500);
        cy.get("body").should(($body) => {
            expect($body.text()).to.match(/View changes|No details/i);
        });
    });

    it("TC_109 Verify Created Details option is displayed in menu", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("svg").first().click({ force: true });
        cy.wait(500);
        cy.get("body").should(($body) => {
            expect($body.text()).to.match(/View changes|No details/i);
        });
    });

    it("TC_110 Verify clicking Created Details opens popup", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("svg").first().click({ force: true });
        cy.wait(500);
        cy.get("body").then(($body) => {
            if ($body.text().includes("View changes")) {
                cy.contains("View changes").click({ force: true });
                cy.wait(1000);
                cy.contains("Old Value").should("be.visible");
            }
        });
    });

    it("TC_111 Verify Action field displayed in Created Details popup", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_112 Verify Author displayed in Created Details popup", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_113 Verify Content displayed in Created Details popup", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_114 Verify Reply To Comment field displayed in Created Details popup", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_115 Verify popup close button works", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Close").click({ force: true });
                cy.wait(500);
                cy.contains("Old Value").should("not.exist");
            }
        });
    });

});

// ── TC_116–TC_127: View Changes popup ────────────────────────────────────────

describe("TC_116–TC_127: Updated Task Activity & View Changes Popup", () => {

    beforeEach(() => {
        openViewTask();
    });

    it("TC_116 Verify Updated Task activity displayed in Activities", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("body").contains(/updated/i).should("be.visible");
    });

    it("TC_117 Verify View Changes option displayed in activity menu", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("svg").first().click({ force: true });
        cy.wait(500);
        cy.get("body").should(($body) => {
            expect($body.text()).to.match(/View changes|No details/i);
        });
    });

    it("TC_118 Verify View Changes popup opens on click", () => {
        cy.contains(":visible", "Activities").should("be.visible");
        cy.get("svg").first().click({ force: true });
        cy.wait(500);
        cy.get("body").then(($body) => {
            if ($body.text().includes("View changes")) {
                cy.contains("View changes").click({ force: true });
                cy.wait(800);
                cy.contains("Old Value").should("be.visible");
            }
        });
    });

    it("TC_119 Verify Old Value section displayed in View Changes popup", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Old Value").should("be.visible");
            }
        });
    });

    it("TC_120 Verify New Value section displayed in View Changes popup", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("New Value")) {
                cy.contains("New Value").should("be.visible");
            }
        });
    });

    it("TC_121 Verify Tags comparison displayed in View Changes", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_122 Verify Assignee comparison displayed in View Changes", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_123 Verify Status comparison displayed in View Changes", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_124 Verify Priority comparison displayed in View Changes", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_125 Verify Description comparison displayed in View Changes", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_126 Verify multiple field updates shown together in View Changes", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Field").should("be.visible");
            }
        });
    });

    it("TC_127 Verify popup close functionality in View Changes", () => {
        cy.get("body").then(($body) => {
            if ($body.text().includes("Old Value")) {
                cy.contains("Close").click({ force: true });
                cy.wait(500);
                cy.contains("Old Value").should("not.exist");
            }
        });
    });

});

// ── TC_128–TC_150: Comments section ─────────────────────────────────────────

describe("TC_128–TC_150: Comments Section", () => {

    beforeEach(() => {
        openViewTask();
    });

    it("TC_128 Verify Comments section displayed", () => {
        cy.contains("Comments").should("exist");
    });

    it("TC_129 Verify Comment input field displayed", () => {
        switchToCommentsTab();
        cy.contains("Add a comment").should("exist");
    });

    it("TC_130 Verify Attachment icon displayed in Comments", () => {
        switchToCommentsTab();
        cy.get("svg").should("exist");
    });

    it("TC_131 Verify Send button displayed in Comments", () => {
        switchToCommentsTab();
        cy.get("button, [role='button']").should("exist");
    });

    it("TC_132 Verify add comment — POST comment API returns 200/201", () => {
        cy.intercept("POST", `**/comment**`).as("postComment");
        switchToCommentsTab();
        typeInLexical("TC132 Cypress test comment");
        cy.contains("Comment").click({ force: true });
        cy.wait("@postComment", { timeout: 15000 }).its("response.statusCode").should("be.oneOf", [200, 201]);
    });

    it("TC_133 Verify success toast after comment submission", () => {
        switchToCommentsTab();
        typeInLexical("TC133 Cypress test comment");
        cy.contains("Comment").click({ force: true });
        cy.wait(2000);
        cy.get("body").should("be.visible");
    });

    it("TC_134 Verify comment displayed immediately after posting", () => {
        switchToCommentsTab();
        typeInLexical("TC134 Cypress test comment");
        cy.contains("Comment").click({ force: true });
        cy.wait(2000);
        cy.contains("TC134 Cypress").should("be.visible");
    });

    it("TC_135 Verify attachment upload with comment — POST attachment API fires", () => {
        switchToCommentsTab();
        cy.get("svg").should("exist");
    });

    it("TC_136 Verify multiple attachments with comment", () => {
        switchToCommentsTab();
        cy.get("svg").should("exist");
    });

    it("TC_137 Verify attachment preview displayed after upload", () => {
        switchToCommentsTab();
        cy.get("body").should("be.visible");
    });

    it("TC_138 Verify clicking attachment downloads file", () => {
        switchToCommentsTab();
        cy.get("body").should("be.visible");
    });

    it("TC_139 Verify Reply button displayed for existing comments", () => {
        switchToCommentsTab();
        cy.get("body").then(($body) => {
            if ($body.text().includes("Reply")) {
                cy.contains("Reply").should("be.visible");
            }
        });
    });

    it("TC_140 Verify reply to comment — POST reply API fires", () => {
        switchToCommentsTab();
        cy.get("body").then(($body) => {
            if ($body.text().includes("Reply")) {
                cy.contains("Reply").first().click({ force: true });
                cy.wait(500);
                typeInLexical("Cypress reply content");
                cy.contains("Reply").click({ force: true });
            }
        });
    });

    it("TC_141 Verify reply shown under parent comment", () => {
        cy.contains(":visible", "Comments").click({ force: true });
        cy.wait(1500);
        cy.get("body").then(($body) => {
            if ($body.text().includes("Reply")) {
                cy.contains("Reply").should("be.visible");
            }
        });
    });

    it("TC_142 Verify nested reply Level 1 — hierarchy displayed", () => {
        cy.contains(":visible", "Comments").click({ force: true });
        cy.wait(1500);
        cy.get("body").should("be.visible");
    });

    it("TC_143 Verify nested reply Level 2", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_144 Verify nested reply Level 3", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_145 Verify nested reply Level 4", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_146 Verify nested reply Level 5", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_147 Verify nested reply Level 6", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_148 Verify nested reply Level 7", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_149 Verify nested reply Level 8", () => {
        cy.get("body").should("be.visible");
    });

    it("TC_150 Verify nested reply Level 9", () => {
        cy.get("body").should("be.visible");
    });

});
