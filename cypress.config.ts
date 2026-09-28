import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:8081",
    viewportWidth: 414,
    viewportHeight: 896,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {},
  },
});
