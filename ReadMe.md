## Contributing

This section of the ReadMe describes our coding standards, specifically the style of code.

### Coding Standards

* **Formatting:**
  This project uses Prettier for code formatting. All code must be formatted before committing.

* **General Guidelines:**

  * This project will use Camel Case
  * Add comments where necessary but self-explanatory code triumphs

  * Use Inter Bold for titles, Open Sans for smaller text and buttons

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


# Database Setup (PostgreSQL)

This project uses PostgreSQL. Follow the steps below to set up the database locally.

---

## 1. Install PostgreSQL

### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu / WSL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### Windows
Download and install from:
https://www.postgresql.org/download/windows/

---

## 2. Create a Database

```bash
createdb calpolyq2s
```

---

## 3. Load the Schema

From the project root:

```bash
psql -d calpolyq2s -f db/schema.sql
```

---

## 5. Verify Connection

```bash
psql -d calpolyq2s
```

Then inside:

```sql
SELECT current_database(), current_user;
```

---

## 6. Environment Variables

Create a `.env` file (do NOT commit this file):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calpolyq2s
DB_USER=your_username
DB_PASSWORD=your_password
```

---

## 7. Connecting with DataGrip (Optional)

```text
Host: localhost
Port: 5432
Database: calpolyq2s
User: your_username
Password: your_password
SSL: Disable
```

---
