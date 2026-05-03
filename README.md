# FashionCollab

A cloud-based collaboration platform for fashion creatives. FashionCollab brings photographers, models, stylists, and designers into a shared project workspace — replacing fragmented communication across WhatsApp, Instagram DMs, and email.

Built as part of a BSc Software Engineering dissertation at Manchester Metropolitan University (2026).

**Live App:** https://fashion-collab-7z9y.vercel.app
**API:** https://fashioncollab-backend.onrender.com
**API Docs:** https://fashioncollab-backend.onrender.com/api/docs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue.js 3, Tailwind CSS, Pinia, Vue Router |
| Backend | Node.js, Express.js (MVC) |
| Database | Supabase (PostgreSQL + Storage) |
| Email | AWS SES (eu-west-1) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Features

- Project workspaces with role-based access control (Owner / Collaborator)
- Moodboard with image upload, viewing, and commenting
- Notes and resource links per project
- Email invite system with accept / decline flow
- Activity feed showing recent actions across the project
- User profiles with bio, role, and social links
- JWT authentication via Supabase Auth

---

## Project Structure

```
FashionCollab/
├── Frontend/               # Vue.js application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── views/
│   │   └── main.js
│   ├── public/
│   ├── .env
│   └── package.json
│
├── Backend/                # Express.js API
│   ├── controllers/
│   │   └── project/
│   ├── models/
│   │   ├── project/
│   │   └── activity/
│   ├── middleware/
│   ├── routes/
│   ├── lib/
│   │   ├── supabase.js
│   │   └── email.js
│   ├── tests/
│   │   ├── setup/
│   │   │   └── mockDb.js
│   │   ├── unit/
│   │   │   ├── auth.test.js
│   │   │   ├── moodboard.test.js
│   │   │   ├── note.test.js
│   │   │   ├── link.test.js
│   │   │   ├── comment.test.js
│   │   │   ├── collaboration.test.js
│   │   │   ├── project.test.js
│   │   │   ├── activity.test.js
│   │   │   └── profile.test.js
│   │   └── integration/
│   │       ├── auth.integration.test.js
│   │       ├── projects.integration.test.js
│   │       ├── profiles.integration.test.js
│   │       └── comments.integration.test.js
│   ├── index.js
│   └── package.json
│
└── supabase/               # Database migrations
    └── migrations/
        └── 20260429000000_init.sql
```

---

## Prerequisites

- Node.js v18+
- npm v9+
- A Supabase account and project (free tier works)
- AWS account with SES configured (eu-west-1) for email notifications
- Scoop (Windows) or Homebrew (Mac) for the Supabase CLI

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ikay106/FashionCollab.git
cd FashionCollab
```

---

### 2. Install the Supabase CLI

**Windows (using Scoop):**
```powershell
irm get.scoop.sh | iex
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Mac (using Homebrew):**
```bash
brew install supabase/tap/supabase
```

Verify the install:
```bash
supabase --version
```

---

### 3. Set up the database

Create a new project at [supabase.com](https://supabase.com). Then from the project root in your terminal:

Log in to the Supabase CLI:
```bash
supabase login
```

Link to your Supabase project (your project ref is in Supabase → Settings → General):
```bash
supabase link --project-ref your-project-ref
```

Push the schema to create all tables automatically:
```bash
supabase db push
```

Also create a storage bucket called `project-moodboards` in **Supabase → Storage → New Bucket** and set it to **Public**.

---

### 4. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-west-1
SES_FROM_EMAIL=your_verified_ses_email
PORT=4000
```

All Supabase values are in **Supabase → Settings → API**.

Start the backend:
```bash
npm run dev
```

The API will be available at `http://localhost:4000`
Swagger docs will be at `http://localhost:4000/api/docs`

---

### 5. Frontend setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Running Tests

All tests are in `Backend/tests/`.

```bash
cd Backend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Test coverage

| Suite | File | Tests |
|---|---|---|
| Auth middleware | unit/auth.test.js | 2 |
| Moodboard model | unit/moodboard.test.js | 8 |
| Note model | unit/note.test.js | 4 |
| Link model | unit/link.test.js | 2 |
| Comment model | unit/comment.test.js | 3 |
| Collaboration model | unit/collaboration.test.js | 3 |
| Project model | unit/project.test.js | 3 |
| Activity model | unit/activity.test.js | 2 |
| Profile model | unit/profile.test.js | 2 |
| Auth endpoints | integration/auth.integration.test.js | 3 |
| Project endpoints | integration/projects.integration.test.js | 9 |
| Profile endpoints | integration/profiles.integration.test.js | 1 |
| Comment endpoints | integration/comments.integration.test.js | 2 |

---

## Deployment

The app is already deployed and live:

- **Frontend:** https://fashion-collab-7z9y.vercel.app (Vercel)
- **Backend:** https://fashioncollab-backend.onrender.com (Render)
- **API Docs:** https://fashioncollab-backend.onrender.com/api/docs


## API Documentation

Swagger UI is available at `/api/docs` when the backend is running locally, and at https://fashioncollab-backend.onrender.com/api/docs for the live deployment.

---

## Known Limitations

- Free tier on Render means the backend spins down after inactivity, first request after a period of no use may take 30-60 seconds
- No real-time notifications via WebSockets, the activity feed polls every 10 seconds


---

## Author

**Ikenna Franklin Anaele**
BSc Software Engineering — Manchester Metropolitan University (2026)
Student ID: 23751829
