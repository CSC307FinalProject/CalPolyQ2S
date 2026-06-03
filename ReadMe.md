## Project Summary

This is the CalPolyQ2S tool. The upcoming quarter to semester and catalog switch is creating a lot of confusion for students at Cal Poly, and we wanted to help clear the confusion. Students have the right to pick the catalog that suits them best, and we want to help them make an informed decision. The original scope of this project was all majors, but with time limitations, was narrowed down to just Computer Science. Some core features include:

- Two Factor User Authentication
- Class search by major and concentration
- Save courses by user into our database
- Class comparison page (main feature)
  - Completed and remaining courses for both catalogs
  - Units remaining
  - Terms remaining

## Deployed Application Website

Website URL - https://orange-bay-0a230d710.7.azurestaticapps.net/

We are bummed that due to deploying on Azure using a student account, we cannot use a custom domain.

## UI Prototypes

https://www.figma.com/design/51lOIbYsvbNh3ut76eCnOM/Goal-Diggers?node-id=0-1&p=f (Last Updated May 1, 2026)

## UML Class Diagram

- [UML Class Diagram](docs/uml-class-diagram.md)

## Development Environment Setup

### Prerequisites

- Node.js 22.x
- npm (included with Node.js)
- Git

### Install dependencies

From the repository root:

```bash
npm install
```

This installs the workspace dependencies for both the frontend and backend.

### Environment variables

Create a local environment file from the example:

```bash
cp .env.example .env
```

Then open `.env` and update the values for:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `TOKEN_SECRET`
- `VERIFICATION_LINK_BASE_URL`
- `SMTP_PASS`
- `SMTP_USER`

Keep `VITE_API_URL` as `http://localhost:3000` for local development.

### Useful commands

- `npm run dev` — start frontend and backend concurrently
- `npm run dev:frontend` — start only the frontend
- `npm run dev:backend` — start only the backend
- `npm run build` — build the frontend
- `npm run start` — start the backend in production mode
- `npm run lint` — run frontend lint checks
- `npm test` — run backend syntax checks

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
