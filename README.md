# Mentora — AI Learning Assistant

**Live URL:** <YOUR_DEPLOYED_APP_URL_HERE>

Mentora is a full‑stack AI-powered learning assistant that helps you turn study material (PDFs) into **summaries**, **flashcards**, and **quizzes**, and lets you **chat with context** to understand concepts faster. It includes authentication, document management, and progress tracking.

---

## Overview

Studying from long PDFs is time-consuming. Mentora streamlines the process by:

- Uploading and storing PDFs (Cloudinary)
- Extracting text from PDFs and generating:
  - Summaries
  - Flashcards (with difficulty)
  - MCQ quizzes (with explanations)
- Providing an AI chat experience grounded in the uploaded document content
- Tracking learning progress over time

---

## Key Features

- **User authentication**
  - Register / Login
  - JWT-based protected routes
  - Profile fetch & update
  - Change password

- **Document handling**
  - Upload PDF files
  - PDF text extraction (`pdf-parse`)
  - File storage via Cloudinary
  - Local uploads served via `/uploads` (backend)

- **AI learning tools (Gemini)**
  - Summary generation
  - Flashcard generation (Q/A + difficulty)
  - Quiz generation (4 options + correct answer + explanation + difficulty)
  - Context-aware chat and concept explanations

- **Progress tracking**
  - APIs available under `/api/progress`

- **Health check endpoint**
  - `GET /health`

---

## Tech Stack

### Frontend

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **React Router**
- **Axios**
- **React Markdown + GFM** (rendering AI output)
- **Lucide React** (icons)

### Backend

- **Node.js** (ESM modules)
- **Express 5**
- **MongoDB + Mongoose**
- **JWT** (`jsonwebtoken`)
- **Password hashing** (`bcryptjs`)
- **Validation** (`express-validator`)
- **File uploads** (`multer`)
- **PDF parsing** (`pdf-parse`)
- **Cloudinary** (PDF storage)
- **Google Gemini** (`@google/genai`)

---

## Project Structure

```text
Learn-with-AI/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
  frontend/
    mentora/
      src/
      public/
```

---

## Screenshots

Add screenshots by replacing the placeholders below.

### UI Preview

| Screen | Screenshot |
| --- | --- |
| Landing / Home | ![Landing](docs/screenshots/landing.png) |
| Login | ![Login](docs/screenshots/login.png) |
| Dashboard | ![Dashboard](docs/screenshots/dashboard.png) |
| Upload PDF | ![Upload](docs/screenshots/upload.png) |
| Summary | ![Summary](docs/screenshots/summary.png) |
| Flashcards | ![Flashcards](docs/screenshots/flashcards.png) |
| Quiz | ![Quiz](docs/screenshots/quiz.png) |
| Chat with Document | ![Chat](docs/screenshots/chat.png) |

> Note: Create the folder `docs/screenshots/` and drop your images there (or update the paths to wherever you store screenshots).

---

## Installation & Setup (Local)

### Prerequisites

- **Node.js** (recommended: latest LTS)
- **npm**
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary account** (for PDF storage)
- **Gemini API key**

---

### 1) Clone the repository

```bash
git clone <YOUR_REPO_URL>
```

---

### 2) Backend setup

Install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (do not commit it):

```bash
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>

# Auth
JWT_SECRET=<A_LONG_RANDOM_SECRET>
JWT_EXPIRE=7d

# Google Gemini
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_API_SECRET>
```

Run backend:

```bash
npm run dev
```

Backend will start on:

- `http://localhost:8000`

---

### 3) Frontend setup

Install dependencies:

```bash
cd frontend/mentora
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend will start on the Vite dev server (usually):

- `http://localhost:5173`

---

## Configuration Notes

- **CORS**: Backend currently allows all origins (`origin: "*"`). For production, restrict this to your deployed frontend URL.
- **Uploads**: Backend serves local static uploads at `GET /uploads/...`.
- **API base path**: All backend APIs are prefixed with `/api`.

---

## API Endpoints (High Level)

- **Auth**: `/api/auth/*`
- **Documents**: `/api/documents/*`
- **Flashcards**: `/api/flashcards/*`
- **AI**: `/api/ai/*`
- **Quizzes**: `/api/quizzes/*`
- **Progress**: `/api/progress/*`
- **Health**: `GET /health`

---

## Future Scope

- **Role-based access (RBAC)** (admin/moderator)
- **Better CORS + security hardening** (rate limiting, helmet, input sanitization)
- **Search inside documents** (full-text search)
- **Spaced repetition scheduling** for flashcards
- **Multi-document knowledge base** (chat across many PDFs)
- **User analytics dashboard** (streaks, mastery, time spent)
- **Export options** (Anki decks, PDF summaries)
- **CI/CD + Docker**
- **Tests** (unit + integration; API contract tests)

---

## Contributing

- Fork the repo
- Create a feature branch
- Commit changes with clear messages
- Open a PR describing what changed and why

---

## License

Add your license here (e.g., MIT) and include a `LICENSE` file at the repo root.
