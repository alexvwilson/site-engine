---
description: Fix Admin Dashboard Performance Issues
status: done
---

# Fix Admin Dashboard Performance Issues

## 1. Task Overview

### Task Title
**Title:** Optimize Admin Dashboard Metrics Queries

### Goal Statement
**Goal:** Resolve the performance issues on the admin dashboard (`/admin/dashboard`) where the page gets stuck on loading. The root cause is connection pool exhaustion caused by firing multiple parallel database queries. The goal is to refactor the data fetching logic to use a single, efficient SQL query, reducing database round-trips and connection usage from 7+ to 1.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
The current implementation of `getSystemMetrics` uses `Promise.all` to execute 7 separate Drizzle queries in parallel. While intended for performance, this floods the connection pool when combined with other dashboard queries, causing the application to hang or timeout, especially under load or with limited connections.

### Solution Options Analysis

#### Option 1: Single SQL Query (Recommended)
**Approach:** Rewrite `getSystemMetrics` to use a single `db.execute(sql\`...\`)` call that aggregates all metrics using subqueries.
**Pros:**
- ✅ Drastically reduces connection overhead (1 connection vs 7).
- ✅ Eliminates connection pool contention.
- ✅ Faster execution time due to reduced network round-trips.
**Cons:**
- ❌ Slightly more complex SQL syntax to maintain.
- ❌ Bypasses some of Drizzle's type safety (requires manual casting).

#### Option 2: Caching (Rejected by User)
**Approach:** Cache the results of the expensive queries.
**Pros:**
- ✅ Fast subsequent loads.
**Cons:**
- ❌ User explicitly rejected caching.
- ❌ First load is still slow/problematic.
- ❌ Data staleness issues.

### Recommendation & Rationale
**🎯 RECOMMENDED SOLUTION:** Option 1 - Single SQL Query.
This directly addresses the root cause (connection flooding) without introducing caching complexity or staleness.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (Postgres) via Drizzle ORM
- **Language:** TypeScript
- **Key Components:** `lib/admin.ts` (data fetching), `app/(protected)/admin/dashboard/page.tsx` (UI).

### Current State
- `getSystemMetrics` in `lib/admin.ts` fires 7 parallel queries.
- Dashboard page calls this + 3 other metric functions in parallel.
- Total simultaneous connections can exceed 10, causing the app to hang.
- Previous attempts to fix this with caching were rejected.
- Previous attempt to fix with SQL had syntax errors due to Drizzle interpolation issues.

---

## 4. Implementation Plan

### Backend Changes (`lib/admin.ts`)
- [ ] **Refactor `getSystemMetrics`**:
    - Replace the 7 parallel `db.select()` calls with a single `db.execute(sql\`...\`)`.
    - Use **raw table names** (e.g., `users`, `transcription_jobs`) in the SQL string to avoid Drizzle parameter interpolation issues that caused syntax errors.
    - Keep date parameters (`todayStart`, `monthStart`) interpolated for safety.
    - Map the raw SQL result back to the `SystemMetrics` interface.
    - Ensure `count` and `sum` results are properly cast to numbers (Postgres returns strings for bigints).

### Verification
- [ ] **Run Diagnostic Script**: Re-run `scripts/diagnose-admin-dashboard.ts` to verify:
    - `getSystemMetrics` executes successfully (no syntax errors).
    - Execution time is acceptable (< 300ms).
- [ ] **Manual Testing**: Load `/admin/dashboard` in the browser to ensure it loads instantly without hanging.

---

## 5. Technical Requirements

### Functional Requirements
- Dashboard must load without getting stuck.
- All metrics (Total Users, Active Jobs, Storage, etc.) must be accurate.

### Non-Functional Requirements
- **Performance:** Dashboard load time under 2 seconds.
- **Reliability:** No database connection timeouts.

---

## 6. Data & Database Changes
No schema changes required. Only query logic changes.

---

## 7. Context & Problem Definition
The admin dashboard is unusable because it tries to open too many database connections at once. We need to batch these requests into a single query to respect connection limits and improve performance.
