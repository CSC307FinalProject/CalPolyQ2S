## Deployed Application Website

Website URL - https://orange-bay-0a230d710.7.azurestaticapps.net/


## Contributing

This section of the ReadMe describes our coding standards, specifically the style of code.

### Coding Standards

- **Formatting:**
  This project uses Prettier for code formatting. All code must be formatted before committing.

- **General Guidelines:**
  - This project will use Camel Case
  - Add comments where necessary but self-explanatory code triumphs

  - Use Inter Bold for titles, Open Sans for smaller text and buttons

---

### Pre-commit Hooks

When you commit:

- Prettier will run on staged files
- Formatting issues will be fixed automatically

---

### IDE Setup

To ensure consistent formatting and linting, install the following extensions:

#### VS Code

1. **Prettier - Code formatter**

#### Setup Steps

1. Install the extensions above

2. Enable format on save:
   - Open VS Code settings
   - Search for `Format On Save`
   - Enable it

3. Set Prettier as default formatter:

   ```json
   "editor.defaultFormatter": "esbenp.prettier-vscode"
   ```

# Database Details (Supabase PostgreSQL)

This project uses a hosted PostgreSQL database via Supabase. Below are instruction to connect the databse to a DataGrip session.

---

In DataGrip:

```
Host: db.YOUR_PROJECT_REF.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: your database password
```

---

# Sequence Diagrams

<img width="886" height="531" alt="User_Signup_Sequence_Diagram" src="https://github.com/user-attachments/assets/1cd577c4-4c1a-4821-9e00-d479b876b0f1" />
<img width="858" height="531" alt="User_Login_Sequence_Diagram" src="https://github.com/user-attachments/assets/39f45c11-c8eb-42b9-a0d1-4f81c2610725" />
