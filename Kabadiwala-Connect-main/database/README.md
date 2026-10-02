# Local SQLite database

Kabadiwala Connect uses SQLite for local development and demos.

- Database file: `data/kabadiwala.db`
- Connection string: `file:./data/kabadiwala.db`
- No MySQL, Docker, XAMPP, or port 3306 is required.

Run:

```bash
npm install --legacy-peer-deps --package-lock=false
npm run db:push
```

The schema is generated from `drizzle/schema.ts` by Drizzle Kit.
