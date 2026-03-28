# SCTCA Climate Action Tracker

## Project Overview
A proof-of-concept web application for the Sonoma County Transportation and Climate Authorities (SCTCA). The MVP is centered on the City of Petaluma's "Blueprint for Climate Action." Zero budget — this serves as a portfolio piece and functional prototype for SCTCA to potentially purchase next fiscal year.

## Tech Stack
- **Database & Backend:** Supabase (PostgreSQL) — free tier
- **Front-End Framework:** Next.js 14+ (React) with App Router and TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (auto-deploys from GitHub)
- **Version Control:** GitHub — brianw123-cell/SonomaCountyTransportationAndClimateAuthorities

## Supabase Configuration
- **Project ID:** idoumsylhfuxwusoniqx
- **Project URL:** https://idoumsylhfuxwusoniqx.supabase.co
- **Region:** us-west-1
- **Organization:** auto-magic (rzrtfzjsorhcxrihhvtc)
- Environment variables are in `.env.local` (never committed — see `.env.local.example` for template)

## Data Model

### Architecture (3 Database Layers)
BC Capps designed a fully normalized relational database with junction tables for all many-to-many relationships. Entities NEVER connect directly — they always traverse through junction tables.

### Layer 1: Actions Database (has data from BC's spreadsheet)
```
ORG (253 rows) → ORG-DOC junction (73 rows) → DOC (73 rows) → DOC-ACT junction (1,061 rows) → ACT (1,061 rows)
ACT → ACT-TRN junction (33 rows) → TRN (213 rows) → TRN-ICR junction (6 rows) → ICR (6 rows)
ORG → ORG-ORG junction (134 rows) — self-referencing parent-child hierarchy
ORG → ORG-RES junction (41 rows) → RES (41 rows)
```

### Layer 2: Projects Database (NEW — no data yet, schemas to be created)
```
ACT → ACT-PRJ junction → PRJ (Projects)
ORG → ORG-PRJ junction → PRJ (Projects) — orgs connect to projects DIRECTLY, not just through DOC→ACT chain
PRJ → PRJ-FND junction → FND (Funding)
ORG → ORG-FND junction → FND (Funding)
ORG → ORG-IND junction (with Role attribute) → IND (Individuals)
```

### Layer 3: External Integrations
- Actions = ICLEI ClearPath 2.0 "Interventions"
- Transitions = ClearPath "Transition Elements"
- ClearPath URL field on each Action/Project for manual linking

### CRITICAL: Traversal Pattern
To find Actions belonging to an Organization, you MUST traverse:
`ORG → DOC-ORG → DOC → ACT-DOC → ACT`
You CANNOT jump directly from ORG to ACT.

### Entity Table Schemas

**ORG:** ORG_ID (PK), ORG_NAME, ORG_URL, ORG_ACRONYM, ORG_LOGO, ORG_TYPE, ORG_DESCRIPTION, ORG_NOTES

**DOC:** DOC_ID (PK), DOC_NAME, ORG_PARENT, DOC_DATE, DOC_TYPE, DOC_URL, DOC_LOCAL, DOC_EVALUATED, DOC_DESCRIPTION, DOC_NOTES

**ACT:** ACT_ID (PK), DOC_NAME, ORG_NAME, ACT_LEVEL1, ACT_LEVEL2, ACT_LEVEL3, ACT_SECTOR, ACT_SPOTLIGHT, ACT_TIMEFRAME, ACT_STATUS, ACT_TIMELINE, ACT_ACTOR, ACT_TYPE, ACT_IMPACTED, ACT_FOCUS, ACT_RESULTS, ACT_PRIORITY

**TRN:** TRN_ID (PK), TRN_NAME, TRN_SECTOR1, TRN_SECTOR2, TRN_SECTOR3, TRN_TYPE

**ICR:** ICR_ID (PK), ICR_NAME (test data only — 6 rows)

**RES:** RES_ID (PK), RES_NAME, ORG_PARENT, RES_DATE, RES_TYPE, RES_URL, RES_DESCRIPTION, RES_NOTES

**PRJ (NEW):** PRJ_ID (PK), PRJ_NAME, PRJ_STATUS, PRJ_BUDGET, PRJ_START_DATE, PRJ_END_DATE, PRJ_FUNDING_SOURCE, PRJ_DESCRIPTION, PRJ_NOTES

**FND (NEW):** FND_ID (PK), FND_NAME, FND_AMOUNT, FND_SOURCE, FND_TYPE, FND_START, FND_END, FND_STATUS, FND_URL, FND_NOTES

**IND (NEW):** IND_ID (PK), IND_NAME, IND_EMAIL, IND_TITLE, IND_PHONE, IND_NOTES

### Junction Table Schemas
All junction tables follow the pattern: REL_ID (PK), REL_FROM (FK), REL_TO (FK), NAME_FROM, NAME_TO, REL_CLASS, REL_TYPE, REL_DIRECTION, REL_NOTES
Exception: ORG-IND also has IND_ROLE attribute.

### Taxonomy / Enum Values (from Lists sheet)
- **DOC_TYPE:** 13 values (Building Analysis Tools, Building Electrification Plans, Climate Action Strategies, etc.)
- **ACT_SECTOR:** 9 values (0.00 - Administration through 8.00 - Social Equity and Community Engagement)
- **ORG_TYPE:** 6 values (Local Municipality, County Government, Special District, NGO, Regional Government, Private Consultant)
- **ACT_TIMELINE:** 3 values (Near-Term: 2025-2027, Mid-Term: 2027-2031, Long-Term: 2031-2035)
- **TRN_TYPE:** 4 values (Shift the mechanism of operation, Reduce the operation needed, Increase efficiency, Shift the resource used)

## Public-Facing Views (from BC's diagrams)
- Climate Action Tracker — main public dashboard
- Public Organizational Directory — read-only org listing
- Public Document Library — browseable document archive
- Climate Funding Tracker — public funding visibility

## Staff Admin Features
- Organizational Submission Form
- Document Submission Form
- Project Submission Form
- Action status update form
- Supabase Auth (email/password)

## Naming Conventions
- Database table names: lowercase with underscores (e.g., `orgs`, `act_doc`)
- Primary keys: follow BC's pattern (ORG-10001, ACT-10001, etc.)
- React components: PascalCase
- Files/folders: kebab-case
- Environment variables: NEXT_PUBLIC_ prefix for client-side, no prefix for server-only

## Project Structure
```
/data              — BC's source spreadsheet and diagram PDFs (reference only, not deployed)
/docs              — Project documentation and building plan
/src/app           — Next.js App Router pages
/src/components    — Reusable React components
/src/lib           — Supabase client, utility functions, queries
/src/types         — TypeScript type definitions
/public            — Static assets (logos, images)
```

## Key People
- **Brian** — SCTCA staff, project lead, learning databases
- **Jen** — Systems architect, must greenlight major decisions
- **BC Capps** — Designed the data model, provided the spreadsheet and ERD diagrams
