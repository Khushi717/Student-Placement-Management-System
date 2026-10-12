# Student Placement Management System (SPMS)

MERN-stack foundation for a college placement portal (SEDP academic project).
Three roles — **Student**, **Company/Recruiter**, **TPO/Admin** — each with its own dashboard.

* Frontend: React 18 + Vite, Tailwind CSS 3, React Router 6, Axios, Lucide, Recharts
* Backend: Node.js (ES modules) + Express 4, Mongoose 8 (MongoDB), JWT, bcrypt, Zod validation
* No paid services or external API keys are needed to run it.

---

## 1. Quick start

Prerequisites: Node.js 18+ and a MongoDB (local or Atlas).

```bash
# 1) install everything (root, server, client)
npm run install:all

# 2) configure the API
cp server/.env.example server/.env        # then edit MONGODB_URI and JWT_SECRET
cp client/.env.example client/.env        # optional in development

# 3) create the first TPO/Admin (admins cannot self-register)
#    set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in server/.env first
npm run seed:admin

# 4) run API (http://localhost:5000) and web app (http://localhost:5173) together
npm run dev
```

Run them separately with `npm run dev:server` and `npm run dev:client`.
In development Vite proxies `/api` to `localhost:5000`, so no CORS setup is needed.

### MongoDB — local
1. Install MongoDB Community Server (or run `docker run -d -p 27017:27017 --name spms-mongo mongo:7`).
2. Keep `MONGODB_URI=mongodb://127.0.0.1:27017/spms` in `server/.env`.

### MongoDB — Atlas (free tier)
1. Create a free M0 cluster at mongodb.com/atlas, add a database user, and allow your IP under *Network Access*.
2. *Connect → Drivers* and copy the `mongodb+srv://…` string into `MONGODB_URI` (replace `<password>`, add `/spms` as the database name).

### Typical demo flow
1. Log in as admin (seeded) in one browser profile.
2. Register a **recruiter** → they see "awaiting verification".
3. Admin: **Verify Companies → Approve**. Recruiter can now **Create Job** (set CGPA/branch/backlog rules).
4. Register a **student** (fill CGPA + resume link in *My Profile*), open **Available Drives**, apply.
5. Recruiter: **Applicants → Shortlist → Schedule interview → Create offer**.
6. Student: **Offers → Accept**. Admin: **Placement Analytics** now shows data.

---

## 2. Architecture

One consistent pattern is used on both sides: **feature modules** (no parallel global `controllers/` and `routes/` folders to keep in sync).

```
spms/
├── package.json               root scripts (dev, build, test, seed)
├── client/src/
│   ├── modules/<feature>/     <feature>.api.js  – the ONLY place that knows REST URLs
│   ├── pages/{public,auth,student,company,admin,shared}/
│   ├── components/{ui,common,layout,forms,dashboard}/   design system + reusable pieces
│   ├── routes/                AppRoutes, ProtectedRoute (login), RoleGuard (role)
│   ├── context/AuthContext    session state
│   ├── hooks/useFetch         loading / error / data handling
│   ├── services/apiClient     axios instance, token header, error helper
│   ├── mocks/mockData.js      ⚠ the ONLY place with mock data (see below)
│   └── utils/
└── server/src/
    ├── config/                env validation, DB connection
    ├── middleware/            auth (authenticate/authorize), validate, errorHandler, rateLimit
    ├── utils/                 ApiError, response envelope, jwt, password, constants
    ├── routes/index.js        registers every module under /api
    ├── modules/<feature>/     <feature>.model.js · .validators.js · .service.js · .controller.js · .routes.js
    ├── scripts/seedAdmin.js
    └── app.js / server.js     app (testable) and bootstrap (DB + listen)
```

**Layering rule:** `routes → controller → service → model`. Routes only declare URL + middleware, controllers translate HTTP
to service calls, services hold the business rules and ownership checks.

**Dependencies flow one way** to avoid circular imports: auth → users/companies; jobs → companies; applications → jobs
(model + eligibility) ; interviews/offers → applications; reports → models (read-only); every module may call
`notifications.service.notify()`, which itself imports nothing from other modules.

**Mock vs real data:** all UI data comes from the API except three clearly marked places: landing-page stats,
the contact form, and the year-over-year trend chart. They import from `client/src/mocks/mockData.js` and render a yellow
**"Sample data"** notice (`MockDataNotice`).

### Why there is no `UserProfile`, `Role`, `EligibilityCriteria` or `PlacementReport` collection
* Role is a validated enum on `User` (`STUDENT | COMPANY | ADMIN`).
* Student academic data is an embedded `studentProfile` sub-document (always read with the user; only students have it).
* Eligibility rules are embedded in `JobPosting` (they have no life outside the job).
* Placement statistics are computed on demand from offers/applications (Mongo aggregations). A `PlacementReport`
  collection can be added when report snapshots/archives are needed.

## 3. Data model

```
User ─┬─1:1── Company            (company.user, unique)   only for role COMPANY
      ├─1:N── Application        (application.student)
      ├─1:N── Notification       (notification.user)
      └─1:N── Feedback           (feedback.student)

Company ──1:N── JobPosting       (job.company, job.postedBy -> User)
Company ──1:N── Feedback         (feedback.company; optional feedback.job)

JobPosting ──1:N── Application   (application.job)     UNIQUE (job, student)  → no duplicate applications
Application ─1:N── InterviewSchedule (interview.application)
Application ─1:1── Offer         (offer.application, unique; offer also stores student/job/company for fast queries)
```

| Model | Notable constraints / indexes |
|---|---|
| User | unique `email`; partial-unique `studentProfile.enrollmentNo`; `password` is `select:false` and stripped from JSON |
| Company | unique `user`; `verificationStatus` PENDING/APPROVED/REJECTED |
| JobPosting | status DRAFT/PUBLISHED/CLOSED/WITHDRAWN; embedded `eligibility {minCgpa, eligibleBranches[], maxActiveBacklogs}`; indexes on `(company,status)`, `(status,deadline)` |
| Application | **unique `(job, student)`**; status APPLIED/SHORTLISTED/INTERVIEW/SELECTED/REJECTED; `statusHistory[]` |
| InterviewSchedule | round, time, mode ONLINE/ONSITE, location/link, status, outcome notes |
| Offer | unique `application`; status PENDING/ACCEPTED/DECLINED |
| Notification | index `(user, isRead, createdAt)` |
| Feedback | rating 1–5; only students who applied to that company may submit |

## 4. How the modules integrate

| Module | Provides | Uses |
|---|---|---|
| 1. User Mgmt & Auth | identity (`req.user`), role checks, suspend/activate | – |
| 2. Company & Jobs | verified companies, job postings, eligibility rules (`checkEligibility`) | Auth (company owner), Notifications |
| 3. Applications / Interviews / Offers | pipeline: apply → shortlist → interview → offer → accept | Jobs (eligibility, ownership), Notifications |
| 4. Notifications, Reports, Feedback | in-app alerts, dashboards, analytics, feedback | read-only on all models |

Event → notification examples: company registers → admins notified; company approved/rejected → recruiter; job published →
*eligible* students; application received → recruiter; status change / interview / offer → student; offer response → recruiter.

## 5. API summary (`/api`)

Legend: ✅ implemented and wired to the UI · 🟡 implemented, minimal · 🔶 placeholder

| Area | Endpoints |
|---|---|
| Health | ✅ `GET /health` |
| Auth | ✅ `POST /auth/register` `POST /auth/login` `POST /auth/logout` `GET /auth/me` · 🟡 `PATCH /auth/change-password` `POST /auth/forgot-password` `POST /auth/reset-password` (reset link is printed to the server console; no e-mail provider) |
| Users | ✅ `GET/PATCH /users/me` · ✅ admin: `GET /users` `GET /users/:id` `PATCH /users/:id/status` |
| Companies | ✅ `GET /companies` `GET /companies/me` `GET /companies/:id` `PATCH /companies/:id` `PATCH /companies/:id/verification` (registration = `POST /auth/register` with `role: COMPANY`) |
| Jobs | ✅ `POST /jobs` `GET /jobs` `GET /jobs/:id` `PATCH /jobs/:id` `PATCH /jobs/:id/status` `DELETE /jobs/:id` |
| Applications | ✅ `POST /applications` `GET /applications/me` `GET /applications` (company/admin applicant list) `GET /applications/:id` `PATCH /applications/:id/status` |
| Interviews | ✅ `POST /interviews` `GET /interviews/me` `PATCH /interviews/:id` |
| Offers | ✅ `POST /offers` `GET /offers/me` `PATCH /offers/:id/respond` |
| Notifications | ✅ `GET /notifications` `PATCH /notifications/:id/read` `PATCH /notifications/read-all` |
| Reports | ✅ `GET /reports/dashboard` `GET /reports/placements` · 🔶 `POST /reports/generate` (returns **501**; PDF/Excel generation not built) |
| Feedback | ✅ `POST /feedback` `GET /feedback` |

All responses use one envelope: `{ success: true, data, meta?, message? }` or `{ success: false, message, errors? }`.

## 6. Security notes

* Passwords hashed with bcrypt (12 rounds); the hash is never returned (`select:false` + `toJSON` transform).
* **Role is never taken from the client:** the registration schema only accepts `STUDENT` or `COMPANY`; admins come from the seed script.
* `authenticate` re-loads the user on every request, so suspending an account takes effect immediately.
* Every protected route uses `authorize(...roles)`; **ownership** is enforced in services (a company can only touch its own jobs/applicants; a student only their own applications/offers; other students' ids return 404, other companies' return 403).
* Zod validates and strips every body/query/params; unknown fields are rejected on write schemas (`.strict()`).
* Helmet, CORS allow-list from `CLIENT_ORIGIN`, JSON body limit, login rate limit (10 / 15 min / IP), generic 500 messages (details only in server logs).
* **JWT storage & logout (important):** the token is kept in `localStorage` (readable by injected scripts if XSS ever occurs; httpOnly cookies are the safer upgrade). `POST /auth/logout` is **stateless** — it cannot revoke a token. The client deletes its copy and the token remains technically valid until `JWT_EXPIRES_IN` (default 1 day). Mitigations in place: short expiry and per-request account-status check. If instant revocation is required, add refresh tokens or a deny-list.

## 7. Testing

```bash
npm run test:unit      # eligibility rules + validators — no database needed
npm test               # everything, including API integration tests
```

* `server/tests/unit` — eligibility logic and validation schemas (**14 tests, passing**).
* `server/tests/integration/spms.test.js` — health, 404, register/login, invalid credentials, protected routes, role authorization, ADMIN self-registration blocked, job creation, unauthorized/unapproved job creation, cross-company edit blocked, duplicate application (409), ineligible application, application status ownership, reading another student's application, interview → offer → accept flow.
  Uses `mongodb-memory-server` (downloads a MongoDB binary on first run) **or** set `MONGODB_URI_TEST=mongodb://127.0.0.1:27017/spms_test` to use your own instance.
  > These were written but **could not be executed in the sandbox used to generate this project** (no MongoDB and no network access to download one). Run them locally and fix anything that surfaces.
* Not covered yet: frontend component tests, notification/report/feedback endpoints, rate-limit behaviour.

## 8. Status

**Verified in the build environment:** server modules load and the API boots; health check, 404 JSON, auth-required (401), invalid-token, ADMIN-registration rejection, weak-password and malformed-JSON handling all respond correctly (checked without a DB); unit tests pass; `vite build` of the client succeeds.

**Written but not run against a live database:** registration/login persistence, job creation/retrieval, applications, interviews, offers, notifications, reports. Treat the first local run as the real integration test.

**Done:** auth + RBAC, profiles, admin user management, company verification, job CRUD + eligibility, applications with duplicate protection, interview scheduling, offers, notification center, analytics dashboard (branch/company/package-wise + historical records), feedback, role dashboards and reusable UI kit.

**TODO / extension points**
- E-mail delivery for password reset and notifications (`auth.service.requestPasswordReset`, `notification.service.notify`)
- Resume file upload (currently a link; `Application.resumeUrl`)
- Real PDF/Excel report generation (`report.service.generateReport` → 501)
- Offer-letter PDF (`Offer` has room for `offerLetterUrl`)
- Refresh tokens / httpOnly cookies / token deny-list
- Admin-created admin accounts from the UI; student withdraw-application; interview reschedule/cancel UI
- Persisted contact form; multi-year historical archive (replace `mocks/mockData.js` trend)
- Client code-splitting (bundle is ~730 kB before gzip)
- Out of scope by design: AI resume matching, predictive analytics, biometrics, job-board integration, video interviews, SMS/WhatsApp, real-time sockets
