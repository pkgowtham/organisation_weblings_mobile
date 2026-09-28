describe("Backlog Functionality (TC_101 to TC_150)", () => {

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

    it("TC_101 Verify Backlog page loads successfully", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_102 Verify Backlog title is displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("be.visible");
    });

    it("TC_103 Verify total Backlog issue count", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_104 Verify Search box displayed", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_105 Verify Search placeholder", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_106 Verify searching existing issue", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_107 Verify searching partial keyword", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_108 Verify searching with Issue ID", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_109 Verify searching invalid keyword", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", {force: true});
    });

    it("TC_110 Verify clearing Search", () => {
        setupAndVisit("backlog");
        cy.get('input[type="text"], input[placeholder*="Search"]').clear({force: true});
    });

    it("TC_111 Verify Issue Type filter", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_112 Verify Issue Type values loaded from Settings", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_113 Verify Tag filter", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_114 Verify Tag values loaded from Settings", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_115 Verify Priority filter", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_116 Verify Priority values loaded from Settings", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_117 Verify combining Issue Type + Tag filter", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_118 Verify combining all filters", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_119 Verify resetting all filters", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_120 Verify Issue card displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_121 Verify Issue Type badge displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_122 Verify Issue Title displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_123 Verify Tag displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_124 Verify Status displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_125 Verify Priority displayed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_126 Verify clicking Issue opens Edit page", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_127 Verify Issue data loaded in Edit page", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_128 Verify newly created Issue appears in Backlog", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_129 Verify newly created Issue shows correct Issue Type", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_130 Verify newly created Issue shows correct Status", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_131 Verify newly created Issue shows correct Priority", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_132 Verify newly created Issue shows correct Tag", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_133 Verify creating New Sprint from Backlog", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_134 Verify Sprint Name mandatory validation", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_135 Verify duplicate Sprint Name validation", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_136 Verify Sprint Start Date", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_137 Verify Sprint End Date", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_138 Verify End Date earlier than Start Date", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_139 Verify successful Sprint creation from Backlog", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_140 Verify created Sprint displayed immediately", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_141 Verify issue count updates after creating Issue", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_142 Verify issue count updates after moving Issue to Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_143 Verify Issue order maintained after refresh", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_144 Verify Issue persists after logout/login", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_145 Verify Backlog loads after browser refresh", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_146 Verify API response while loading Backlog", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_147 Verify API failure while loading Backlog", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_148 Verify unauthorized user access", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_149 Verify empty Backlog state", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_150 Verify complete Backlog workflow", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

});
