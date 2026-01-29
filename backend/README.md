# Task Manager Backend

Node.js/Express backend API for Angular Task Manager with PostgreSQL database.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Initialize database (creates tables):

```bash
npm run build
npm run init-db
```

3. Start development server:

```bash
npm run dev
```

The server will run on http://localhost:3000

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL=your_postgresql_connection_string
PORT=3000
NODE_ENV=development
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run init-db` - Initialize database tables
