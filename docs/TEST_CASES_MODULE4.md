# Module 4 Test Cases: Notification, Reporting & Analytics (and Feedback)

**Project:** Student Placement Management System (SPMS)
**Tester:** Keshav Kumar
**Test type:** Automated API integration tests (Jest + Supertest + in-memory MongoDB)
**Test file:** `server/tests/integration/module4.test.js`
**How to run:** `cd server && npm test -- tests/integration/module4.test.js`
**Pull request:** #2 (branch `feature/module4-tests`)

## Result summary

| Suite | Test cases | Passed | Failed |
|---|---|---|---|
| Notifications | 7 | 7 | 0 |
| Reports & analytics | 5 | 5 | 0 |
| Feedback | 13 (F4 runs 5 ratings) | 13 | 0 |
| **Module 4 total** | **25** | **25** | **0** |
| Full integration suite (with team tests) | 42 | 42 | 0 |

## Notifications

| ID | Endpoint | Scenario | Expected result | Status |
|---|---|---|---|---|
| N1 | GET /api/notifications | No token | 401 Unauthorized | Pass |
| N2 | GET /api/notifications | Recruiter, after a student applies | 200, at least 1 notification | Pass |
| N3 | GET /api/notifications | Student, after being shortlisted | 200, at least 1 notification | Pass |
| N4 | PATCH /api/notifications/:id/read | Owner marks own notification | 200, notification `isRead = true` | Pass |
| N5 | PATCH /api/notifications/:id/read | Another user's notification | Rejected (403 or 404) | Pass |
| N6 | PATCH /api/notifications/read-all | Recruiter with unread notifications | 200, all notifications read | Pass |
| N7 | GET /api/notifications | Student with no events | 200, empty list (no leak of recruiter's notifications) | Pass |

## Reports & analytics

| ID | Endpoint | Scenario | Expected result | Status |
|---|---|---|---|---|
| R1 | GET /api/reports/dashboard | No token | 401 | Pass |
| R2 | GET /api/reports/dashboard | Student token | 403 Forbidden | Pass |
| R3 | GET /api/reports/dashboard | Admin token | 200, `success = true` | Pass |
| R4 | GET /api/reports/placements | Admin, after an accepted offer | 200, data returned | Pass |
| R5 | POST /api/reports/generate | Admin | 501 Not Implemented (PDF/Excel not built) | Pass |

## Feedback

Request body: `{ companyId, jobId?, rating (integer 1-5), comments? }`. The schema is strict, so unknown fields are rejected.

| ID | Endpoint | Scenario | Expected result | Status |
|---|---|---|---|---|
| F1 | POST /api/feedback | No token | 401 | Pass |
| F2 | POST /api/feedback | Company token | 403 | Pass |
| F3 | POST /api/feedback | Student who never applied to that company | Rejected (400 or 403) | Pass |
| F4a | POST /api/feedback | rating = 0 | 400 | Pass |
| F4b | POST /api/feedback | rating = 6 | 400 | Pass |
| F4c | POST /api/feedback | rating = -1 | 400 | Pass |
| F4d | POST /api/feedback | rating = "abc" | 400 | Pass |
| F4e | POST /api/feedback | rating = 3.5 | 400 | Pass |
| F5 | POST /api/feedback | Student who applied, valid body | 201 Created | Pass |
| F6 | POST /api/feedback | Boundary ratings 1 and 5 | Both 201 | Pass |
| F7 | POST /api/feedback | Extra unknown field | 400 | Pass |
| F8 | POST /api/feedback | Malformed `companyId` | 400 | Pass |
| F9 | POST /api/feedback | Comments over 2000 characters | 400 | Pass |

Techniques used: positive and negative testing, boundary value analysis (ratings 0, 1, 5, 6), role-based access testing (no token, wrong role, other user), and input validation testing.

## Defects and observations

| # | Finding | Type | Evidence |
|---|---|---|---|
| 1 | Existing integration suite failed on `main` (11 of 17 tests). The test helper sent `resumeUrl` at registration, which the validator rejects as an unrecognized key. | Test data out of date | Debug test returned 400 "Unrecognized key(s) in object: 'resumeUrl'" |
| 2 | Two existing tests used 2-character enrollment numbers (`X1`, `L1`), below the validator's minimum of 3. | Test data invalid | `enrollmentNo` is `min(3)` in `user.validators.js` |
| 3 | Apply requests need a resume link (in the body or the profile). Existing tests did not send one. | Test data out of date | `applyToJob` returns 400 without a resume |
| 4 | A student can submit unlimited feedback for the same company (two submissions both returned 201). | Possible defect, check against SRS | Test F6 |
| 5 | README says 14 unit tests and lists student withdrawal as a TODO. The code has 15 unit tests and a working withdraw endpoint. | Documentation out of date | `npm run test:unit` showed 15 passed |

Items 1 to 3 were fixed in the pull request (`helpers.js` and `spms.test.js`).

## Not covered (limitations)

- Correctness of the analytics numbers (the tests check access and that data is returned, not the calculations).
- Frontend components and UI behaviour.
- Email delivery (not implemented).
- Login rate limiting.
- Load and performance testing.
- Notifications for events other than application received and shortlisted.
