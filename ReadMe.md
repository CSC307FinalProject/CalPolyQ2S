## Contributing

This section of the ReadMe describes our coding standards, specifically the style of code.

### Coding Standards

* **Formatting:**
  This project uses Prettier for code formatting. All code must be formatted before committing.

* **General Guidelines:**

  * This project will use Camel Case
  * Add comments where necessary but self-explanatory code triumphs

---

### Pre-commit Hooks

When you commit:

* Prettier will run on staged files
* Formatting issues will be fixed automatically

---

### IDE Setup

To ensure consistent formatting and linting, install the following extensions:

#### VS Code

1. **Prettier - Code formatter**

#### Setup Steps

1. Install the extensions above

2. Enable format on save:

   * Open VS Code settings
   * Search for `Format On Save`
   * Enable it

3. Set Prettier as default formatter:

   ```json
   "editor.defaultFormatter": "esbenp.prettier-vscode"
   ```