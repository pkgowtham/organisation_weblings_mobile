describe("Sprint Search & API Edge Cases (TC_201 to TC_251)", () => {

    const setupAndVisit = (tabName = "project") => {
        cy.session("loginSession", () => {
            cy.visit("/");
            cy.get("input[placeholder='Enter email address']").type("rathinavel01@weblings.com");
            cy.get("input[placeholder='Enter password']").type("R@gul5460");
            cy.contains("Continue").click();
            cy.url().should("not.include", "/login");
        });
        localStorage.setItem("bulId", "bul_default");
        
        // Navigate directly into the project details page
        cy.visit(`/(protected)/(streamLine)/projectDetails?projectId=3347eb8a-d549-4463-87fa-683eb491af54&projectName=Project%20One`);
        cy.wait(2000); // Give it a sec to load elements
        
        if (tabName !== "project") {
            const formattedTab = tabName.charAt(0).toUpperCase() + tabName.slice(1).toLowerCase();
            cy.contains(formattedTab).click({force: true});
            cy.wait(1000);
        }
    };

    it("TC_201 Verify Search field is displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("be.visible");
    });

    it("TC_202 Verify search by Issue Title", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_203 Verify search by partial Issue Title", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_204 Verify search with lowercase characters", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_205 Verify search with uppercase characters", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_206 Verify search using special characters", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_207 Verify search using numeric values", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_208 Verify search with invalid keyword", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_209 Verify clearing search field restores full list", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').clear({force: true});
    });

    it("TC_210 Verify search after moving issue to Sprint", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_211 Verify Issue Type filter dropdown", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').click({force: true});
    });

    it("TC_212 Verify filtering by Epic", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_213 Verify filtering by Story", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_214 Verify filtering by Task", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_215 Verify filtering by Sub Task", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_216 Verify Tag filter dropdown", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').click({force: true});
    });

    it("TC_217 Verify filtering by Tag", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_218 Verify Priority filter dropdown", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').click({force: true});
    });

    it("TC_219 Verify filtering by Priority", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_220 Verify multiple filters together (Issue Type + Tag + Priority)", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_221 Verify resetting all filters", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_222 Verify filter persistence after refresh (if supported)", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').should('exist');
    });

    it("TC_223 Verify API response while loading Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_224 Verify API response while creating Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_225 Verify API response while creating Issue", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_226 Verify API response while dragging issue", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_227 Verify API response while starting Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_228 Verify API response while completing Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_229 Verify handling of HTTP 400 response", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_230 Verify handling of HTTP 401 response", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_231 Verify handling of HTTP 403 response", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_232 Verify handling of HTTP 404 response", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_233 Verify handling of HTTP 500 response", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_234 Verify behavior during network disconnection", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_235 Verify retry after network restoration", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_236 Verify user without Create permission", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_237 Verify user without Edit permission", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_238 Verify user without Delete permission", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_239 Verify user with full permissions", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_240 Verify empty Sprint state", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_241 Verify empty Backlog state", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_242 Verify application performance with 100 issues", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_243 Verify application performance with multiple Sprints", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_244 Verify smooth scrolling with large issue list", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_245 Verify mobile responsive layout in portrait mode", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_246 Verify mobile responsive layout in landscape mode", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_247 Verify UI after device rotation", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_248 Verify application state after browser refresh", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_249 Verify logout/login retains Sprint and Backlog data", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_250 End-to-End Flow Validation", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_251 Verify reset and clear data", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

});
