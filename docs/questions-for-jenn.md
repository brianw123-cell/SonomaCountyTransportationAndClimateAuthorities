# Questions for Jenn — With Responses

## Answered Questions

### 1. Tech stack approval
**Q:** The doc recommends Supabase + Next.js + Tailwind + Vercel. Does Jen agree, or does she have preferences? (e.g., does SCTCA already use AWS/Azure? Any existing auth systems?)

**Jenn:** We would need more requirements from the team, in the meeting they mentioned they have some internal hosting they might want to use but we should follow up. If they are ok with us training someone on this stack it should be fine but we will want to transfer it all to their name once done.

**Status:** Proceed with current stack for now. Follow up with SCTCA on internal hosting preferences and plan for account transfer.

---

### 2. Authentication requirements
**Q:** Who logs in? Just SCTCA staff for editing? Or do city staff (Petaluma) also need accounts? What auth method — email/password, SSO, Google?

**Jenn:** I would stick with basic username + email for this one. I don't believe they have any unified auth but if they do all share Gmail accounts, that would be a great next option.

**Status:** Resolved. Using email/password auth (already built). Google OAuth is a potential future enhancement.

---

### 3. Row-Level Security (RLS)
**Q:** Should Petaluma staff only see their own data? Or can all staff see everything?

**Jenn:** This felt like it should be public to all — should confirm.

**Status:** Partially resolved. Data is public-read for now. Need to confirm with SCTCA stakeholders that full public visibility is acceptable.

---

### 4. ClearPath integration
**Q:** The doc mentions staff manually pasting URLs into ClearPath. Does Jen know ClearPath's URL format or any API it exposes?

**Jenn:** No publicly available API as I can see, but we would build a periodic CSV export → ingest pipeline into your PostgreSQL database, not a live API connection. Should be fairly easy but it is a process that would need someone to ramp up on in case anything broke.

**Status:** Resolved. Build CSV export/import pipeline (not live API). Need to document the pipeline process for handoff.

---

### 5. Domain/hosting
**Q:** Will this live at a subdomain of scta.ca.gov or a separate domain?

**Jenn:** Stakeholders need to let us know what they prefer.

**Status:** Open — waiting on SCTCA stakeholders.

---

### 6. PROJ table schema
**Q:** Does Jen have opinions on what fields a "Project" needs beyond what the doc suggests (budget, status, dates, funding source)?

**Jenn:** We should start pretty minimal at first (these look good) but we need to lock in the primary key relationship and the unique identifiers ASAP — i.e. how a project relates to an org (something meaningful beyond any text-based field) maybe an address, idk.

**Status:** Partially resolved. Current fields are fine to start. Need to define a meaningful unique identifier for projects beyond text fields (address, permit number, etc.). Discuss at next meeting.

---

### 7. Data migration strategy
**Q:** Import via CSV upload to Supabase, or scripted SQL inserts? (I'd recommend scripted for repeatability.)

**Jenn:** I am envisioning both — export from ClearPath, some minimal processing in our pipeline, then scripted inserts to our DB.

**Status:** Resolved. Pipeline is: ClearPath CSV export → processing/validation → scripted DB inserts. CSV import tool and GHG upload already built in admin.

---

### 8. Environments
**Q:** Do we need staging + production, or just one environment for the MVP?

**Jenn:** Just one for all MVPs always. Once things feel like we can't mess them up or break them, that's when you want to explore other envs.

**Status:** Resolved. Single production environment for MVP. Add staging later when stable.

---

### 9. Funding table schema
**Q:** What fields does FND need? (Grant name, amount, source agency, start/end dates, status, type?) Is there existing funding data to seed?

**Jenn:** Not sure about this one, need to dig in more. My instinct is these are perfect to start with. Curious if there will be many funding entities to one org or project. My guess is yes.

**Status:** Partially resolved. Current fields are good. Confirmed many-to-many relationship (multiple funding sources per org/project). Already modeled with junction tables (prj_fnd, org_fnd). Need to seed with real funding data when available.

---

### 10. Individuals table
**Q:** Is this for the MVP or a later phase? What fields — name, email, phone, title, role? Any privacy concerns with storing contact info?

**Jenn:** Sounds like a Users table — every product we build generally should have users. And those fields are good. MVP should always have one to start. No concerns with privacy honestly really ever with these small projects unless explicitly stated by our customers.

**Status:** Resolved. Individuals/contacts table is in MVP (already built). Fields: name, email, phone, title, notes. No special privacy handling needed unless customer requests it.

---

### 11. Role attribute on ORG-IND
**Q:** Is this a free-text field or a dropdown (e.g., "Project Manager", "Climate Coordinator", "Council Member")?

**Jenn:** To start — I'd make it text with good validation to avoid dupes.

**Status:** Resolved. Free text with validation. Consider adding duplicate detection or autocomplete suggestions in a future iteration.

---

### 12. Document storage
**Q:** Does BC envision actual PDF file uploads (Supabase Storage), or just URL links to existing hosted documents? The spreadsheet already has DOC_URL and DOC_LOCAL fields.

**Jenn:** This would probably be nice! But for MVP I'd totally avoid it for now.

**Status:** Resolved. URL links only for MVP (already built). File uploads via Supabase Storage deferred to post-MVP.

---

### 13. Evaluation Criteria
**Q:** (Shown on the Projects Database layer): What is this? A scoring rubric for projects? Who defines the criteria?

**Jenn:** No idea.

**Status:** Open — need to clarify with BC Capps what the evaluation criteria entity represents.

---

### 14. Scope for MVP
**Q:** The full vision has 3 database layers. For the weekend prototype, should we build all three, or just the Actions Database layer (which already has data) plus the PRJ table?

**Jenn:** Would love to spend time on this specifically next time we meet so we can lock in the data models.

**Status:** Partially resolved. All 3 layers are scaffolded in the MVP. Need to review and finalize data models with Jenn at next meeting.

---

## Open Questions Summary

These items still need follow-up:

| # | Question | Waiting On |
|---|----------|------------|
| 1 | Internal hosting preferences — does SCTCA want to use their own infrastructure? | SCTCA stakeholders |
| 3 | Confirm public visibility of all data is acceptable | SCTCA stakeholders |
| 5 | Domain choice — subdomain of scta.ca.gov or separate? | SCTCA stakeholders |
| 6 | Meaningful unique identifier for Projects (address, permit #, etc.) | Next meeting with Jenn |
| 9 | Seed real funding data when available | SCTCA team |
| 13 | What are "Evaluation Criteria" in BC's data model? | BC Capps |
| 14 | Finalize data models for all 3 layers | Next meeting with Jenn |
