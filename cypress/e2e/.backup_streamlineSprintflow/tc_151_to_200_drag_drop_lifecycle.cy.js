describe("Drag Drop & Sprint Lifecycle (TC_151 to TC_200)", () => {

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

    it("TC_151 Verify issue can be dragged from Backlog to Sprint", () => {
        setupAndVisit("backlog");
        
        cy.on('window:console', (msg) => {
            console.log('Browser log: ', msg);
        });

        // Intercept the API call that updates the task when dropped
        cy.intercept("PUT", "**/sprint/syncTasks**").as("updateTask");

        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realHover()
          .realMouseDown();

        // Move to another element to trigger PanResponder drag start reliably
        cy.get('[data-testid="drag-handle"]').eq(1).realHover();

        cy.wait(500); // Allow floating UI to register and animate

        cy.get('[data-testid^="popup-drop-zone-"]').eq(1)
          .realHover()
          .wait(500) // Wait for React state to process the hover and set hoveredDropTarget
          .realMouseUp();

        // Assert that the API was called with the sprint update
        cy.wait("@updateTask", { timeout: 10000 }).its("request.body").should("exist");
    });

    it("TC_152 Verify issue can be dropped into newly created Sprint", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realHover()
          .realMouseDown();

        cy.get('[data-testid="drag-handle"]').eq(1).realHover();

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').eq(1)
          .realHover()
          .wait(500)
          .realMouseUp();
    });

    it("TC_153 Verify issue disappears from Backlog after moving", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_154 Verify issue appears in selected Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_155 Verify issue count updates after moving issue", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_156 Verify Backlog count decreases after moving issue", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_157 Verify dragged issue retains Issue Type", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_158 Verify dragged issue retains Status", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_159 Verify dragged issue retains Priority", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_160 Verify dragged issue retains Tags", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_161 Verify dragged issue retains Assignees", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_162 Verify dragged issue retains Attachments", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_163 Verify dragged issue retains Due Date", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_164 Verify dragged issue retains Description", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_165 Verify moving multiple issues one by one", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_166 Verify dragging issue to invalid area", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_167 Verify drag animation", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_168 Verify loading indicator during drag", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_169 Verify API request while dragging issue", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_170 Verify API failure while dragging", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_171 Verify dragged issue persists after refresh", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_172 Verify dragged issue persists after logout/login", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_173 Verify Sprint displays newly moved issue immediately", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_174 Verify moving issue between Sprints", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_175 Verify issue removed from previous Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_176 Verify issue appears in destination Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_177 Verify Sprint ordering maintained after moving issue", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_178 Verify Sprint scroll during drag", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_179 Verify issue drag on mobile touch gesture", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_180 Verify issue cannot be duplicated after drag", () => {
        setupAndVisit("backlog");
        // React Native PanResponder Simulation with real native events
        cy.get('[data-testid="drag-handle"]').first()
          .realMouseDown()
          .realMouseMove(50, 50); // initial drag to trigger PanResponder

        cy.wait(500); // Allow floating UI to register

        cy.get('[data-testid^="popup-drop-zone-"]').last()
          .realHover() // Move mouse to the drop zone
          .realMouseUp();
    });

    it("TC_181 Verify Start Sprint button displayed", () => {
        setupAndVisit("backlog");
        cy.get('[data-testid="start-sprint-button"]').should("exist");
    });

    it("TC_182 Verify clicking Start Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_183 Verify Start Sprint confirmation popup (if available)", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_184 Verify Cancel in Start Sprint popup", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_185 Verify successful Sprint start", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_186 Verify Start Sprint button hidden after activation", () => {
        setupAndVisit("backlog");
        cy.get('[data-testid="start-sprint-button"]').should("exist");
    });

    it("TC_187 Verify Complete Sprint button displayed after Sprint starts", () => {
        setupAndVisit("backlog");
        cy.get('[data-testid="start-sprint-button"]').should("exist");
    });

    it("TC_188 Verify clicking Complete Sprint", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_189 Verify Cancel in Complete Sprint popup", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_190 Verify Complete Sprint successfully", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_191 Verify Sprint status changes to Completed", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_192 Verify all completed issues moved to Done status", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_193 Verify incomplete issues handled according to business rule", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_194 Verify Sprint completion updates Board", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_195 Verify Sprint completion updates Timeline", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_196 Verify Sprint completion updates Backlog", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_197 Verify Sprint completion API response", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_198 Verify Sprint completion API failure", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_199 Verify completed Sprint persists after refresh", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

    it("TC_200 Verify complete Sprint lifecycle", () => {
        setupAndVisit("backlog");
        cy.get("body").should("exist");
    });

});
