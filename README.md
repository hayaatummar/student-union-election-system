<<<<<<< HEAD
##  Features
=======
## 🏛️ About UoH Student Elections

At the University of Hyderabad (also called UoH / HCU), student union elections are highly political, with multiple student organizations and alliances contesting every year.

### 🗳️ Election 2025–26 Results

The 2025–26 elections saw a major victory for the **ABVP–SLVD alliance**.

| Position | Winner | Alliance |
|----------|--------|----------|
| President | Siva Palepu | ABVP–SLVD |
| Vice President | Debendra | ABVP–SLVD |
| General Secretary | Shruti Priya | ABVP–SLVD |
| Joint Secretary | Saurabh Shukla | ABVP–SLVD |
| Sports Secretary | Jwala | ABVP–SLVD |
| Cultural Secretary | Venus | ABVP–SLVD |

**Key Stats:** 169 candidates · 81%+ voter turnout · 29 polling booths · 6 positions

---

### 🏛️ Major Student Organizations at UoH

| Abbreviation | Full Name | Ideology |
|---|---|---|
| ABVP | Akhil Bharatiya Vidyarthi Parishad | Right / Nationalist |
| SLVD | Sevalal Vidyarthi Dal | OBC / Tribal Rights |
| SFI | Students' Federation of India | Left / CPI(M) |
| ASA | Ambedkar Students' Association | Ambedkarite / Dalit |
| AISA | All India Students' Association | Left / CPI(ML) |
| NSUI | National Students' Union of India | Congress-backed |
| DSU | Democratic Students' Union | Left / Ambedkarite |
| BSF | Bahujan Students' Front | Bahujan / BSP-linked |
| MSF | Muslim Students Federation | Minority Rights |
| PDSU | Progressive Democratic Students Union | Progressive / Left |
| TSF | Telangana Students' Front | Telangana Regional |
| AIOBCSA | All India OBC Students Association | OBC Rights |

### 🤝 Alliance Map — 2025–26

| Alliance | Parties | Result |
|---|---|---|
| ABVP–SLVD | ABVP + SLVD | 🏆 Won all 6 positions |
| BSF–DSU–SFI–TSF | BSF + DSU + SFI + TSF | Runner-up |
| ASA–AISA–Fraternity–MSF | ASA + AISA + Fraternity + MSF | Third |

---

## 🚀 Features
>>>>>>> fe632c39 (Updated website design and features)

###  Authentication
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Election Commission Admin, Candidate, Student)
- Session persistence with Zustand
- Protected routes per role

<<<<<<< HEAD
### Admin
=======
### 👑 Election Commission (Admin)
>>>>>>> fe632c39 (Updated website design and features)
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
- View all 169 candidates with party affiliations
- Vote securely (one vote per position per election)
- Voting confirmation modal
- View voting history
- View published results with rankings

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

<<<<<<< HEAD
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
=======
## ⚙️ Setup Instructions
>>>>>>> fe632c39 (Updated website design and features)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/uoh_election_db"
JWT_SECRET="uoh-election-system-super-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

### 3. Database Setup

```bash
createdb uoh_election_db
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

### 4. Run the Application

```bash
npm run dev
```

Frontend → `http://localhost:5173` | Backend → `http://localhost:5000`

---

##  Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Election Commission (Admin) | `admin@uohyd.ac.in` | `Admin@123` |
| Student Voter | `rahul.verma@uohyd.ac.in` | `Student@123` |
| Candidate (ABVP–SLVD President) | `siva.palepu@uohyd.ac.in` | `Student@123` |
| Candidate (BSF Alliance President) | `ananya.dash@uohyd.ac.in` | `Student@123` |

---

## 🗄️ Seeded Data

After running `npm run seed`:

- **2 Elections**: 2025–26 (ACTIVE) and 2024–25 (RESULTS_PUBLISHED)
- **6 Positions**: President, Vice President, General Secretary, Joint Secretary, Sports Secretary, Cultural Secretary
- **32 Candidates** across all positions from all major alliances
- **15 Demo Voters** from various UoH schools
- **Simulated votes** reflecting realistic vote counts

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

<<<<<<< HEAD
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
=======
## 🔒 Security Features
>>>>>>> fe632c39 (Updated website design and features)

- JWT token authentication
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min)
- Helmet.js security headers
- CORS configuration
- Input validation (express-validator)
- Duplicate vote prevention (DB unique constraint)
- Role-based route protection

---

<<<<<<< HEAD
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
=======
*Built for the University of Hyderabad Students' Union Election System — Academic Year 2025–26*
>>>>>>> fe632c39 (Updated website design and features)
