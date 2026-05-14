#  Student Union Election System

A modern, full-stack web application for managing university student union elections. Built with React, Node.js, PostgreSQL, and Prisma ORM.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue) ![Prisma](https://img.shields.io/badge/ORM-Prisma-purple)

---

##  Features

###  Authentication
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin, Candidate, Student)
- Session persistence with Zustand
- Protected routes per role

### Admin
- Dashboard with live statistics and charts
- Create, edit, delete, and manage elections
- Approve/reject candidate applications
- Manage all users (CRUD)
- View voting analytics with Recharts
- Publish election results
- Enable/disable voting
- Full audit log trail

###  Candidate
- Campaign profile management
- Upload profile photo and campaign poster
- Write and update manifesto
- View real-time vote count
- Social links (Twitter, LinkedIn)

### Student/Voter
- Browse active elections
- View candidate profiles and manifestos
- Vote securely (one vote per position per election)
- Voting confirmation modal
- View voting history
- View published results

### Analytics
- Real-time vote count updates via Socket.IO
- Charts: Area, Bar, Pie (Recharts)
- Votes over time
- Department-wise voter turnout
- Election participation overview

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS + ShadCN UI |
| State | Zustand |
| HTTP | Axios |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcryptjs |
| Real-time | Socket.IO |
| File Upload | Multer |

---

##  Project Structure

```
student-union-election-system/
├── backend/
│   ├── config/          # Prisma client config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, upload, error
│   ├── prisma/          # Schema + seed data
│   ├── routes/          # Express routers
│   ├── utils/           # Response helpers, audit logger
│   └── server.js        # Entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/      # ShadCN components
│       │   └── common/  # Reusable components
│       ├── context/     # Zustand stores
│       ├── layouts/     # Sidebar, Topbar, DashboardLayout
│       ├── pages/       # All page components
│       │   ├── public/  # Landing, Login, Register
│       │   ├── admin/   # Users, Audit Logs
│       │   └── candidate/ # Campaign profile
│       ├── routes/      # ProtectedRoute
│       ├── services/    # API service layer
│       └── utils/       # Helpers, cn utility
│
└── README.md
```

---

##  Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install all dependencies
npm run install:all
```

### 2. Configure Environment

**Backend** — copy and edit:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/election_db"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

**Frontend** — copy and edit:
```bash
cp frontend/.env.example frontend/.env
```

### 3. Database Setup

```bash
# Create the database in PostgreSQL
createdb election_db

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with sample data
npm run seed
```

### 4. Run the Application

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run separately:
```bash
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

---

##  Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@university.edu | Admin@123 |
| Student | alice@university.edu | Student@123 |
| Candidate | james@university.edu | Student@123 |

---

##  API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Elections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/elections` | List elections |
| GET | `/api/elections/:id` | Get election |
| POST | `/api/elections` | Create election (Admin) |
| PUT | `/api/elections/:id` | Update election (Admin) |
| DELETE | `/api/elections/:id` | Delete election (Admin) |
| PUT | `/api/elections/:id/status` | Update status (Admin) |
| GET | `/api/elections/:id/results` | Get results |

### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidates` | List candidates |
| GET | `/api/candidates/me` | My candidate profile |
| POST | `/api/candidates/apply` | Apply for election |
| PUT | `/api/candidates/profile/update` | Update campaign |
| PUT | `/api/candidates/:id/status` | Approve/reject (Admin) |

### Votes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/votes` | Cast vote |
| GET | `/api/votes/my-votes` | My voting history |
| GET | `/api/votes/check/:electionId` | Check vote status |
| GET | `/api/votes/election/:id` | Election votes (Admin) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats (Admin) |
| GET | `/api/analytics/election/:id` | Election analytics (Admin) |
| GET | `/api/analytics/audit-logs` | Audit logs (Admin) |

---

##  Database Schema

```
Users ──────────────────────────────────────────────────────
  id, fullName, email, password, studentId, department, role

Elections ──────────────────────────────────────────────────
  id, title, description, startDate, endDate, status

Positions ──────────────────────────────────────────────────
  id, title, description, electionId

Candidates ─────────────────────────────────────────────────
  id, userId, electionId, positionId, manifesto, status, voteCount

Votes ──────────────────────────────────────────────────────
  id, userId, electionId, candidateId, positionId
  UNIQUE(userId, electionId, positionId)  ← prevents duplicate votes

AuditLogs ──────────────────────────────────────────────────
  id, userId, electionId, action, details, ipAddress
```

---

##  Pages

| Page | Path | Access |
|------|------|--------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Dashboard | `/dashboard` | All roles |
| Elections | `/elections` | All roles |
| Vote | `/elections/:id/vote` | Student |
| Candidates | `/candidates` | All roles |
| Results | `/results` | All roles |
| My Votes | `/my-votes` | Student |
| Analytics | `/analytics` | Admin |
| Users | `/admin/users` | Admin |
| Audit Logs | `/admin/audit-logs` | Admin |
| Campaign | `/candidate/profile` | Candidate |
| Profile | `/profile` | All roles |

---

## Security Features

- JWT token authentication
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min)
- Helmet.js security headers
- CORS configuration
- Input validation (express-validator)
- Duplicate vote prevention (DB unique constraint)
- Role-based route protection

---

## Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grid layouts
- Dark/light mode toggle
- Touch-friendly UI

---

##  Built for Assessment

This project demonstrates:
- Full-stack architecture
- RESTful API design
- Database relationships
- Authentication & authorization
- Real-time features (Socket.IO)
- Modern React patterns (hooks, context, Zustand)
- Clean, modular code structure
- Professional UI/UX design
