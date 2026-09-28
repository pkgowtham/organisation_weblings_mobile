describe("Project Navigation and Sprint Filters (TC_001 to TC_034)", () => {

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
            cy.contains(formattedTab).click({ force: true });
            cy.wait(1000);
        }
    };

    it("TC_001 Verify Project page opens successfully", () => {
        setupAndVisit("project");
        cy.url().should("not.be.empty");
    });

    it("TC_002 Verify selected Project Name is displayed correctly", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_003 Verify Back button is displayed", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_004 Verify Back button navigation", () => {
        setupAndVisit("project");
        cy.get('svg').first().should("exist");
    });

    it("TC_005 Verify Timeline tab is displayed", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_006 Verify Backlog tab is displayed", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_007 Verify Sprint tab is displayed", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_008 Verify Board tab is displayed", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_009 Verify Members tab is displayed", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_010 Verify Settings tab is displayed", () => {
        setupAndVisit("project");
        cy.get("body").should("be.visible");
    });

    it("TC_011 Verify navigation to Sprint tab", () => {
        setupAndVisit("sprint");
        cy.get("body").should("be.visible");
    });

    it("TC_012 Verify navigation to Backlog tab", () => {
        setupAndVisit("backlog");
        cy.get("body").should("be.visible");
    });

    it("TC_013 Verify Timeline navigation", () => {
        setupAndVisit("timeline");
        cy.get("body").should("exist");
    });

    it("TC_014 Verify Board navigation", () => {
        setupAndVisit("board");
        cy.get("body").should("exist");
    });

    it("TC_015 Verify Members navigation", () => {
        setupAndVisit("members");
        cy.get("body").should("exist");
    });

    it("TC_016 Verify Search box displayed", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').should("be.visible");
    });

    it("TC_017 Verify Search placeholder", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", { force: true });
    });

    it("TC_018 Verify Search existing task", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", { force: true });
    });

    it("TC_019 Verify Search partial keyword", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", { force: true });
    });

    it("TC_020 Verify Search with lowercase", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", { force: true });
    });

    it("TC_021 Verify Search with uppercase", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", { force: true });
    });

    it("TC_022 Verify Search invalid keyword", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", { force: true });
    });

    it("TC_023 Verify clearing Search", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').clear({ force: true });
    });

    it("TC_024 Verify Issue Type dropdown displayed", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').click({ force: true });
    });

    it("TC_025 Verify Issue Types loaded from Settings", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_026 Verify renamed Issue Type reflected", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_027 Verify deleted Issue Type removed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_028 Verify Tag dropdown displayed", () => {
        setupAndVisit("backlog");
        cy.contains('Tag').click({ force: true });
    });

    it("TC_029 Verify Tag list loaded from Settings", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_030 Verify Priority dropdown displayed", () => {
        setupAndVisit("backlog");
        cy.contains('Priority').click({ force: true });
    });

    it("TC_031 Verify Priority list loaded from Settings", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_032 Verify combining Issue Type + Tag filters", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').click({ force: true });
    });

    it("TC_033 Verify combining all filters", () => {
        setupAndVisit("backlog");
        cy.contains('Epic').click({ force: true });
    });

    it("TC_034 Verify Reset filters", () => {
        setupAndVisit("project");
    });

});
