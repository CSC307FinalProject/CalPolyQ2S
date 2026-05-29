const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl:
      process.env.CYPRESS_BASE_URL ||
      "https://orange-bay-0a230d710.7.azurestaticapps.net",
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.js",
  },
});
