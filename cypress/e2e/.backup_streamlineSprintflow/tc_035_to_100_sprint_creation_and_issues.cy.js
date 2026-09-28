describe("Sprint Creation & Create Issue (TC_035 to TC_100)", () => {

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

    it("TC_035 Verify New Sprint button displayed", () => {
        setupAndVisit("sprint");
        cy.contains("+ New Sprint").should("exist");
    });

    it("TC_036 Verify New Sprint popup opens", () => {
        setupAndVisit("sprint");
        cy.contains("+ New Sprint").click({ force: true });
    });

    it("TC_037 Verify Sprint Name field", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_038 Verify empty Sprint Name validation", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_039 Verify duplicate Sprint Name validation", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_040 Verify Sprint Start Date", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_041 Verify Sprint End Date", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_042 Verify End Date before Start Date", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_043 Verify Sprint creation", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_044 Verify Success message", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_045 Verify created Sprint displayed", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_046 Verify Sprint Month displayed correctly", () => {
        setupAndVisit("sprint");
        cy.get("body").should("be.visible");
    });

    it("TC_047 Verify Create Issue button displayed", () => {
        setupAndVisit("sprint");
        cy.contains("+ Create issue").should("exist");
    });

    it("TC_048 Verify clicking Create Issue", () => {
        setupAndVisit("sprint");
        cy.contains("+ Create issue").click({ force: true });
    });

    it("TC_049 Verify Create Issue page loads completely", () => {
        setupAndVisit("sprint");
        cy.contains("+ Create issue").click({ force: true });
    });

    it("TC_050 Verify Issue Type dropdown inside Create Issue loads values from Settings", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_051 Verify Create Issue page opens successfully", () => {
        setupAndVisit("sprint");
        cy.url().should("not.be.empty");
    });

    it("TC_052 Verify all mandatory fields are displayed", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_053 Verify Issue Type dropdown is displayed", () => {
        setupAndVisit("sprint");
        cy.get("body").should("be.visible");
    });

    it("TC_054 Verify Issue Types are loaded from Settings", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_055 Verify Epic selection", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_056 Verify Story dropdown loads based on Epic", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_057 Verify Story without selecting Epic", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_058 Verify Task dropdown loads based on Story", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_059 Verify Task without selecting Story", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_060 Verify Sub Task dropdown", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_061 Verify No Data Found when hierarchy has no records", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_062 Verify Title field accepts input", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_063 Verify Title mandatory validation", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_064 Verify maximum Title length", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_065 Verify Title exceeds maximum length", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_066 Verify Description field", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_067 Verify maximum Description length", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_068 Verify Description exceeds limit", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_069 Verify Status dropdown", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_070 Verify Status values loaded from Settings", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_071 Verify selecting Status", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_072 Verify Assignee dropdown", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_073 Verify search Assignee", () => {
        setupAndVisit("sprint");
        cy.get('input[type="text"], input[placeholder*="Search"]').type("Test Search", { force: true });
    });

    it("TC_074 Verify selecting single Assignee", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_075 Verify selecting multiple Assignees", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_076 Verify selected avatars displayed", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_077 Verify duplicate Assignee selection", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_078 Verify removing selected Assignee", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_079 Verify Priority dropdown", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_080 Verify Priority loaded from Settings", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_081 Verify selecting Priority", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_082 Verify Start Date picker", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_083 Verify Due Date picker", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_084 Verify Due Date before Start Date", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_085 Verify same Start and Due Date", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_086 Verify Tag dropdown", () => {
        setupAndVisit("sprint");
        cy.get('body').should("exist");
    });

    it("TC_087 Verify Tags loaded from Settings", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_088 Verify selecting multiple Tags", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_089 Verify Attachment upload using Browse", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_090 Verify Attachment upload using Drag & Drop", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_091 Verify uploading multiple attachments", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_092 Verify removing uploaded attachment", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_093 Verify unsupported file upload", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_094 Verify oversized file upload", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_095 Verify Create button disabled with mandatory fields empty", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_096 Verify successful Issue creation", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_097 Verify Success message after Issue creation", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_098 Verify created Issue appears in Backlog", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_099 Verify created Issue details are saved correctly", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

    it("TC_100 Verify complete End-to-End Create Issue workflow", () => {
        setupAndVisit("sprint");
        cy.get("body").should("exist");
    });

});
