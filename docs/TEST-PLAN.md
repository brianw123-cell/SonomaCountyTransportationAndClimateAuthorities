# SCTCA Climate Action Tracker — Test Plan

**Version:** 1.0
**Date:** March 29, 2026
**Project:** SCTCA Climate Action Tracker MVP
**URL:** https://sctca-climate-tracker.vercel.app
**Prepared by:** Brian West / Claude Code

---

## 1. Automated Test Results (March 29, 2026)

### 1.1 Route Health Check — ALL PASSING

| Route | Status | Description |
|---|---|---|
| `/` | ✅ 200 | Dashboard (multi-jurisdiction) |
| `/organizations` | ✅ 200 | Organizational Directory |
| `/documents` | ✅ 200 | Document Library |
| `/transitions` | ✅ 200 | Climate Transitions |
| `/projects` | ✅ 200 | Project Tracker |
| `/funding` | ✅ 200 | Funding Tracker |
| `/contacts` | ✅ 200 | Contact Directory |
| `/emissions` | ✅ 200 | GHG Emissions Dashboard |
| `/emissions/compare` | ✅ 200 | Jurisdiction Comparison |
| `/emissions/detail` | ✅ 200 | Emissions Data Explorer |
| `/reports` | ✅ 200 | Reports Landing |
| `/reports/actions` | ✅ 200 | Action Summary Report |
| `/reports/sectors` | ✅ 200 | Sector Breakdown Report |
| `/reports/emissions` | ✅ 200 | GHG Emissions Report |
| `/reports/organizations` | ✅ 200 | Organization Directory Report |
| `/login` | ✅ 200 | Staff Login |
| `/admin` | ✅ 200 | Admin Dashboard |
| `/actions/ACT-12001` | ✅ 200 | Action Detail Page |

### 1.2 Database Row Count Verification — ALL PASSING

| Table | Expected | Actual | Status |
|---|---|---|---|
| orgs | 253 | 253 | ✅ |
| docs | 73 | 73 | ✅ |
| actions | 1,061 | 1,061 | ✅ |
| transitions | 213 | 213 | ✅ |
| indicators | 6 | 6 | ✅ (test data) |
| resources | 41 | 41 | ✅ |
| ghg_inventory | 1,206 | 1,206 | ✅ (cleaned) |
| org_org | 134 | 134 | ✅ |
| doc_org | 73 | 73 | ✅ |
| act_doc | 1,061 | 1,061 | ✅ |
| act_trn | 10 | 10 | ✅ |
| trn_icr | 6 | 6 | ✅ |
| org_res | 41 | 41 | ✅ |

### 1.3 Referential Integrity — ALL PASSING

| Junction Table | Broken rel_from | Broken rel_to | Status |
|---|---|---|---|
| act_doc → docs / actions | 0 | 0 | ✅ |
| doc_org → orgs / docs | 0 | 0 | ✅ |
| org_org → orgs / orgs | 0 | 0 | ✅ |
| org_res → orgs / resources | 0 | 0 | ✅ |
| act_trn → actions / transitions | 0 | 0 | ✅ |

### 1.4 Key Data Verification — ALL PASSING

| Test | Expected | Actual | Status |
|---|---|---|---|
| Petaluma traversal (ORG→DOC→ACT) | 455 actions | 455 | ✅ |
| Petaluma GHG 2022 total | 379,381 MTCO2e | 379,381 | ✅ |
| GHG jurisdictions | 11 | 11 | ✅ |
| GHG inventory years | 6 | 6 | ✅ |
| Duplicate org_ids | 0 | 0 | ✅ |
| Duplicate doc_ids | 0 | 0 | ✅ |
| Duplicate act_ids | 0 | 0 | ✅ |
| Tables without RLS | 0 | 0 | ✅ |

### 1.5 Build Verification

| Check | Status |
|---|---|
| TypeScript compilation | ✅ No errors |
| Next.js build | ✅ All 29 routes compiled |
| Vercel deployment | ✅ Production live |

### 1.6 Issues Found and Fixed During Automated Testing

| Issue | Severity | Resolution |
|---|---|---|
| GHG inventory had 1,540 rows (334 duplicates from partial seeding) | Medium | Cleaned — deduplicated to 1,206 correct rows |
| Petaluma GHG 2022 was double-counted (736,434 vs expected 379,381) | Medium | Fixed by dedup above |

---

## 2. Manual Test Checklist

### 2.1 Public Pages — Page Load and Data Display

**Instructions:** Visit each URL and verify the page loads with real data.

| # | Page | URL | Check | Tester | Pass? |
|---|---|---|---|---|---|
| 1 | Dashboard | `/` | Page loads, shows Petaluma actions, jurisdiction selector visible | | |
| 2 | Dashboard | `/?org=ORG-10008` | Switching to Santa Rosa shows different actions | | |
| 3 | Dashboard | `/` | Sector cards show counts, clicking filters the list | | |
| 4 | Dashboard | `/` | Search bar filters actions by text | | |
| 5 | Dashboard | `/` | Expand an action card — all fields show | | |
| 6 | Organizations | `/organizations` | 253 orgs displayed, type pills filter correctly | | |
| 7 | Organizations | `/organizations` | Search by name works, Export CSV downloads file | | |
| 8 | Documents | `/documents` | 73 docs displayed, type and eval filters work | | |
| 9 | Documents | `/documents` | Evaluated progress bar shows correct percentage | | |
| 10 | Documents | `/documents` | "View Document" links open external URLs | | |
| 11 | Transitions | `/transitions` | 213 transitions grouped by sector, expandable | | |
| 12 | Transitions | `/transitions` | Search filters by name | | |
| 13 | Projects | `/projects` | Shows empty state or any created projects | | |
| 14 | Funding | `/funding` | Shows empty state or any created funding | | |
| 15 | Contacts | `/contacts` | Shows empty state or any added contacts | | |
| 16 | Emissions | `/emissions` | Real GHG data, jurisdiction switcher works | | |
| 17 | Emissions | `/emissions` | Sector breakdown shows Transportation 66.5% for Petaluma | | |
| 18 | Emissions Compare | `/emissions/compare` | All 11 jurisdictions in table, sortable columns | | |
| 19 | Emissions Detail | `/emissions/detail` | Filters by jurisdiction/year/sector, shows raw rows | | |
| 20 | Action Detail | `/actions/ACT-12001` | Full detail page loads with all fields | | |
| 21 | 404 Page | `/nonexistent` | Shows branded 404 page | | |

### 2.2 Authentication and Admin

| # | Test | Steps | Expected Result | Tester | Pass? |
|---|---|---|---|---|---|
| 22 | Sign up | Go to `/login`, click "Sign up", enter email + password | Account created, redirected to `/admin` | | |
| 23 | Sign in | Go to `/login`, enter credentials | Redirected to `/admin`, nav shows "Admin" | | |
| 24 | Sign out | Click "Sign Out" on admin page | Redirected to login, nav shows "Login" | | |
| 25 | Auth guard | Visit `/admin` while logged out | Redirected to `/login` | | |
| 26 | Nav state | After login, check nav bar | "Admin" link appears instead of "Login" | | |

### 2.3 Admin Forms

| # | Form | URL | Steps | Expected Result | Tester | Pass? |
|---|---|---|---|---|---|---|
| 27 | Create Project | `/admin/projects/new` | Fill all fields, select action + org, submit | Project created with PRJ-10001 ID, success message | | |
| 28 | Create Project (minimal) | `/admin/projects/new` | Fill only name, submit | Project created with just name | | |
| 29 | Update Action | `/admin/actions` | Search for ACT-12001, change status to "In Progress", save | Status saved, confirmation shown | | |
| 30 | Add Organization | `/admin/orgs/new` | Fill name + type, submit | Org created with ORG-10257+ ID | | |
| 31 | Add Document | `/admin/docs/new` | Fill name + type + org link, submit | Doc created, linked to org | | |
| 32 | Add Funding | `/admin/funding/new` | Fill name + amount + status, submit | Funding created with FND-10001 ID | | |
| 33 | Add Contact | `/admin/contacts/new` | Fill name + email + org, submit | Contact created, linked to org | | |
| 34 | CSV Import | `/admin/import` | Upload a small test CSV for orgs | Preview shows, import succeeds | | |
| 35 | GHG Upload | `/admin/ghg-upload` | Upload a GHG CSV, click Append | Data appended, count increases | | |
| 36 | Role Management | `/admin/roles` | Set role to "SCTCA Staff" | Role saved, badge appears on admin dashboard | | |

### 2.4 Filters and Interactive Features

| # | Page | Test | Steps | Expected | Tester | Pass? |
|---|---|---|---|---|---|---|
| 37 | Dashboard | Sector filter | Click "Transportation" sector card | Only transportation actions shown, count updates | | |
| 38 | Dashboard | Clear filter | Click active sector card again | All actions restored | | |
| 39 | Dashboard | Timeline filter | Select "Near-Term: 2025-2027" from dropdown | Only near-term actions shown | | |
| 40 | Dashboard | Combined filters | Set sector + search text | Both filters apply together | | |
| 41 | Organizations | Type filter pill | Click "Local Municipality" | Only municipalities shown (should be ~10) | | |
| 42 | Documents | Evaluated filter | Click "Evaluated" stat card | Only evaluated docs shown | | |
| 43 | Emissions | Switch jurisdiction | Click "Santa Rosa" pill | All charts/numbers update to Santa Rosa | | |
| 44 | Emissions Compare | Sort table | Click "Change %" column header | Table re-sorts by that column | | |

### 2.5 Reports (Print)

| # | Report | URL | Steps | Expected | Tester | Pass? |
|---|---|---|---|---|---|---|
| 45 | Action Report | `/reports/actions` | Select Petaluma, click "Print Report" | Print dialog opens, clean layout, no nav/buttons in print | | |
| 46 | Sector Report | `/reports/sectors` | Select Petaluma, click "Print Report" | Actions grouped by sector, page breaks between sectors | | |
| 47 | Emissions Report | `/reports/emissions` | Select Petaluma, click "Print Report" | Year trend + sector tables, source attribution | | |
| 48 | Org Report | `/reports/organizations` | No filter, click "Print Report" | All orgs grouped by type, clean table layout | | |

### 2.6 CSV Export

| # | Page | Test | Expected | Tester | Pass? |
|---|---|---|---|---|---|
| 49 | Organizations | Click "Export Organizations" | CSV downloads with all 253 orgs | | |
| 50 | Documents | Click "Export Documents" | CSV downloads with all 73 docs | | |
| 51 | Emissions | Click "Export CSV" | CSV downloads with GHG data for selected jurisdiction | | |

### 2.7 Cross-Browser Testing

| # | Browser | Test | Pass? |
|---|---|---|---|
| 52 | Chrome (desktop) | Full walkthrough of items 1-10 above | |
| 53 | Safari (desktop) | Full walkthrough of items 1-10 above | |
| 54 | Chrome (mobile/phone) | Dashboard loads, nav scrollable, actions expand | |
| 55 | Safari (iPhone) | Dashboard loads, nav scrollable, actions expand | |

### 2.8 Data Accuracy Spot Checks

Pick 5 random actions from BC's original spreadsheet and verify the data matches in the app.

| # | Action ID | Field to Check | Spreadsheet Value | App Value | Match? |
|---|---|---|---|---|---|
| 56 | ACT-12001 | act_level1 | (check spreadsheet) | (check app) | |
| 57 | ACT-12050 | act_sector | (check spreadsheet) | (check app) | |
| 58 | ACT-12100 | act_level3 | (check spreadsheet) | (check app) | |
| 59 | ACT-10001 | org_name | (check spreadsheet) | (check app) | |
| 60 | ACT-12200 | act_sector | (check spreadsheet) | (check app) | |

---

## 3. Known Data Quality Issues

These are pre-existing data quality issues from BC's spreadsheet, NOT bugs in the application:

| Issue | Count | Severity | Notes |
|---|---|---|---|
| Actions missing status (act_status NULL) | 1,040 of 1,061 | Expected | Most actions haven't been evaluated yet — this is normal for early-stage data |
| Actions missing timeline | 1,041 of 1,061 | Expected | Same as above |
| Actions missing actor | 557 of 1,061 | Expected | Not all actions have assigned actors |
| Orgs with no type assigned | 198 of 253 | Low | Many orgs are referenced but not fully classified |
| Orgs with no URL | 208 of 253 | Low | Many orgs don't have known websites |
| Orgs starting with "???" | 26 | Low | BC's placeholders for groups that need identification |
| Orgs marked "*Needs Refinement" | 27 | Low | BC flagged these for review |
| Docs not evaluated | 56 of 73 | Low | Evaluation is in progress |
| 1 duplicate org | ORG-10222 vs ORG-10249 | Low | Same name, one has trailing space |
| 1 orphan action | ACT-12476 | Low | No doc link, no org, no sector |
| Indicators table | 6 test rows | Info | BC's placeholder test data |

Use the **Data Health Dashboard** at `/admin/data-health` to monitor and fix these issues.

---

## 4. Test Environment

| Component | Detail |
|---|---|
| **Production URL** | https://sctca-climate-tracker.vercel.app |
| **Database** | Supabase project `idoumsylhfuxwusoniqx` (us-west-1) |
| **Hosting** | Vercel (auto-deploys from GitHub) |
| **Repository** | github.com/brianw123-cell/SonomaCountyTransportationAndClimateAuthorities |
| **Framework** | Next.js 16.2.1 + TypeScript |
| **Test accounts** | Create via `/login` sign-up form |

---

## 5. Regression Testing Notes

After any future changes, re-run these minimum checks:

1. `npx next build` — must compile with no errors
2. Verify all routes return 200 (automated curl check)
3. Database row counts haven't changed unexpectedly
4. Junction table referential integrity is intact
5. Petaluma traversal still returns 455 actions
6. GHG data still totals correctly

---

*Document generated: March 29, 2026*
*SCTCA Climate Action Tracker v1.0*
