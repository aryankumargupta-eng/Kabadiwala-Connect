# Kabadiwala Connect — Windows setup

This version uses **SQLite**, so MySQL, Docker, XAMPP, and port 3306 are not required.

## One-time setup

```bash
npm install --legacy-peer-deps --package-lock=false
```

## Start everything

From the project root, run only:

```bash
npm run dev
```

The `predev` script automatically applies the Drizzle SQLite schema before starting both processes.

- Frontend: http://localhost:5173/
- API: http://localhost:3000/
- Database: `data/kabadiwala.db`

The dev launcher starts the Express/tRPC API and Vite together and stops both when you press `Ctrl+C`.

## Production check

```bash
npm run build
npm start
```

## Authentication

Email/password signup and login use the local SQLite database. Mobile OTP requires the configured Twilio credentials; it is not silently mocked in production code.
