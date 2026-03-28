-- ============================================================
-- SCTCA Climate Action Tracker - Database Schema
-- Migration 001: Create all tables
-- Based on BC Capps' normalized relational data model
-- ============================================================

-- ============================================================
-- ENUM / LOOKUP TABLES (from Lists sheet)
-- ============================================================

CREATE TABLE doc_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE act_sectors (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE org_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE act_timelines (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE trn_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Seed enum values
INSERT INTO doc_types (name) VALUES
  ('Building Analysis Tools'),
  ('Building Electrification Plans'),
  ('Building Energy Reach Codes'),
  ('Building Performance Standards'),
  ('Building Stock Analysis'),
  ('Building Upgrade Guides'),
  ('Climate Action Strategies'),
  ('Contractor Search'),
  ('Customer Education'),
  ('Direct Install Programs'),
  ('Incentives and Financing'),
  ('Social Equity Resources'),
  ('Other');

INSERT INTO act_sectors (name) VALUES
  ('0.00 - Administration'),
  ('1.00 - Built Environment'),
  ('2.00 - Transportation and Other Mobile Sources'),
  ('3.00 - Solid Waste'),
  ('4.00 - Wastewater and Water'),
  ('5.00 - Agricultural and Livestock'),
  ('6.00 - Forest Land and Trees'),
  ('7.00 - Climate Adaptation and Community Resilience'),
  ('8.00 - Social Equity and Community Engagement');

INSERT INTO org_types (name) VALUES
  ('Local Municipality'),
  ('County Government'),
  ('Special District'),
  ('Non-Governmental Organization'),
  ('Regional Government'),
  ('Private Consultant');

INSERT INTO act_timelines (name) VALUES
  ('Near-Term: 2025-2027'),
  ('Mid-Term: 2027-2031'),
  ('Long-Term: 2031-2035');

INSERT INTO trn_types (name) VALUES
  ('Shift the mechanism of operation'),
  ('Reduce the operation needed'),
  ('Increase efficiency'),
  ('Shift the resource used');

-- ============================================================
-- LAYER 1: ACTIONS DATABASE (existing data from BC's spreadsheet)
-- ============================================================

-- Organizations
CREATE TABLE orgs (
  org_id TEXT PRIMARY KEY,            -- e.g., 'ORG-10001'
  org_name TEXT NOT NULL,
  org_url TEXT,
  org_acronym TEXT,
  org_logo TEXT,
  org_type TEXT,                       -- references org_types.name
  org_description TEXT,
  org_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (climate action plans, strategies, etc.)
CREATE TABLE docs (
  doc_id TEXT PRIMARY KEY,            -- e.g., 'DOC-10001'
  doc_name TEXT NOT NULL,
  org_parent TEXT,                     -- display name of parent org
  doc_date DATE,
  doc_type TEXT,                       -- references doc_types.name
  doc_url TEXT,
  doc_local TEXT,                      -- local filename for stored PDF
  doc_evaluated TEXT,                  -- 'Y', 'N', or '?'
  doc_description TEXT,
  doc_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions (specific climate actions from documents)
CREATE TABLE actions (
  act_id TEXT PRIMARY KEY,            -- e.g., 'ACT-10001'
  doc_name TEXT,                       -- display name of parent document
  org_name TEXT,                       -- display name of parent organization
  act_level1 TEXT,                     -- goal level (e.g., 'Goal 01: Increase Building Energy Efficiency')
  act_level2 TEXT,                     -- category (e.g., 'Actions', 'Policies')
  act_level3 TEXT,                     -- specific measure description
  act_sector TEXT,                     -- references act_sectors.name
  act_spotlight TEXT,                  -- spotlight code (e.g., 'PET-001')
  act_timeframe TEXT,                  -- e.g., 'Ongoing'
  act_status TEXT,                     -- e.g., 'Ongoing', 'Not Started', 'Complete'
  act_timeline TEXT,                   -- references act_timelines.name
  act_actor TEXT,                      -- who is responsible
  act_type TEXT,                       -- e.g., 'Policy Development'
  act_impacted TEXT,                   -- who is impacted (can be multi-line)
  act_focus TEXT,                      -- focus area
  act_results TEXT,                    -- expected results (can be multi-line)
  act_priority NUMERIC,               -- priority ranking
  clearpath_url TEXT,                  -- URL for ICLEI ClearPath 2.0 integration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transitions (behavioral/technological shifts)
CREATE TABLE transitions (
  trn_id TEXT PRIMARY KEY,            -- e.g., 'TRN-10001'
  trn_name TEXT NOT NULL,
  trn_sector1 TEXT,                    -- primary sector (e.g., 'Transportation')
  trn_sector2 TEXT,                    -- sub-sector (e.g., 'Personal Mobility')
  trn_sector3 TEXT,                    -- sub-sub-sector
  trn_type TEXT,                       -- references trn_types.name
  trn_examples TEXT,                   -- example applications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indicators (test data only — 6 rows)
CREATE TABLE indicators (
  icr_id TEXT PRIMARY KEY,            -- e.g., 'ICR-10001'
  icr_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (tools, databases, programs)
CREATE TABLE resources (
  res_id TEXT PRIMARY KEY,            -- e.g., 'RES-10001'
  res_name TEXT NOT NULL,
  org_parent TEXT,                     -- display name of parent org
  res_date DATE,
  res_type TEXT,                       -- references doc_types.name (same taxonomy)
  res_url TEXT,
  res_description TEXT,
  res_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LAYER 2: PROJECTS DATABASE (NEW — no data yet)
-- ============================================================

-- Projects (on-the-ground tasks implementing actions)
CREATE TABLE projects (
  prj_id TEXT PRIMARY KEY,            -- e.g., 'PRJ-10001'
  prj_name TEXT NOT NULL,
  prj_status TEXT,                     -- e.g., 'Not Started', 'In Progress', 'Complete'
  prj_budget NUMERIC,                  -- budget in dollars
  prj_start_date DATE,
  prj_end_date DATE,
  prj_funding_source TEXT,
  prj_description TEXT,
  prj_notes TEXT,
  clearpath_url TEXT,                  -- URL for ICLEI ClearPath 2.0 integration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funding (grants, funding sources)
CREATE TABLE funding (
  fnd_id TEXT PRIMARY KEY,            -- e.g., 'FND-10001'
  fnd_name TEXT NOT NULL,
  fnd_amount NUMERIC,
  fnd_source TEXT,                     -- granting agency/org
  fnd_type TEXT,                       -- grant type
  fnd_start DATE,
  fnd_end DATE,
  fnd_status TEXT,                     -- e.g., 'Applied', 'Awarded', 'Active', 'Closed'
  fnd_url TEXT,
  fnd_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individuals (contacts at organizations)
CREATE TABLE individuals (
  ind_id TEXT PRIMARY KEY,            -- e.g., 'IND-10001'
  ind_name TEXT NOT NULL,
  ind_email TEXT,
  ind_title TEXT,
  ind_phone TEXT,
  ind_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JUNCTION TABLES — Layer 1 (existing data)
-- ============================================================

-- ORG-ORG: Organization hierarchy (parent-child, partnerships)
CREATE TABLE org_org (
  rel_id TEXT PRIMARY KEY,            -- e.g., 'REL-10001'
  rel_from TEXT NOT NULL REFERENCES orgs(org_id),
  rel_to TEXT NOT NULL REFERENCES orgs(org_id),
  name_from TEXT,
  name_to TEXT,
  rel_type TEXT,                       -- e.g., 'ORG-ORG'
  rel_type2 TEXT,                      -- e.g., 'Parent-Child', 'Parent-Program'
  rel_direction TEXT,                  -- e.g., 'Directed'
  rel_notes TEXT
);

-- DOC-ORG: Links organizations to their documents
CREATE TABLE doc_org (
  rel_id TEXT PRIMARY KEY,            -- e.g., 'REL-20001'
  rel_from TEXT NOT NULL REFERENCES orgs(org_id),
  rel_to TEXT NOT NULL REFERENCES docs(doc_id),
  name_from TEXT,
  name_to TEXT,
  rel_class TEXT,                      -- e.g., 'ORG-DOC'
  rel_type TEXT,                       -- e.g., 'Parent-Document'
  rel_direction TEXT,
  rel_notes TEXT
);

-- ACT-DOC: Links documents to their actions
CREATE TABLE act_doc (
  rel_id TEXT PRIMARY KEY,            -- e.g., 'REL-30001'
  rel_from TEXT REFERENCES docs(doc_id),
  rel_to TEXT REFERENCES actions(act_id),
  name_from TEXT,
  name_to TEXT,
  rel_class TEXT,                      -- e.g., 'DOC-ACT'
  rel_type TEXT,                       -- e.g., 'Parent-Action'
  rel_direction TEXT,
  rel_notes TEXT
);

-- ACT-TRN: Links actions to transitions
CREATE TABLE act_trn (
  rel_id TEXT PRIMARY KEY,            -- e.g., 'REL-40001'
  rel_from TEXT REFERENCES actions(act_id),
  rel_to TEXT REFERENCES transitions(trn_id),
  name_from TEXT,
  name_to TEXT,
  act_sector TEXT,
  rel_notes TEXT
);

-- TRN-ICR: Links transitions to indicators
CREATE TABLE trn_icr (
  rel_id TEXT PRIMARY KEY,            -- e.g., 'REL-50001'
  rel_from TEXT NOT NULL REFERENCES transitions(trn_id),
  rel_to TEXT NOT NULL REFERENCES indicators(icr_id),
  name_from TEXT,
  name_to TEXT,
  rel_notes TEXT
);

-- ORG-RES: Links organizations to resources
CREATE TABLE org_res (
  rel_id TEXT PRIMARY KEY,            -- e.g., 'REL-60001'
  rel_from TEXT NOT NULL REFERENCES orgs(org_id),
  rel_to TEXT NOT NULL REFERENCES resources(res_id),
  name_from TEXT,
  name_to TEXT,
  rel_class TEXT,                      -- e.g., 'ORG-RES'
  rel_type TEXT,                       -- e.g., 'Parent-Resource'
  rel_direction TEXT,
  rel_notes TEXT
);

-- ============================================================
-- JUNCTION TABLES — Layer 2 (NEW — no data yet)
-- ============================================================

-- ACT-PRJ: Links actions to projects
CREATE TABLE act_prj (
  rel_id TEXT PRIMARY KEY,
  rel_from TEXT NOT NULL REFERENCES actions(act_id),
  rel_to TEXT NOT NULL REFERENCES projects(prj_id),
  name_from TEXT,
  name_to TEXT,
  rel_class TEXT DEFAULT 'ACT-PRJ',
  rel_type TEXT,
  rel_direction TEXT DEFAULT 'Directed',
  rel_notes TEXT
);

-- ORG-PRJ: Links organizations directly to projects
CREATE TABLE org_prj (
  rel_id TEXT PRIMARY KEY,
  rel_from TEXT NOT NULL REFERENCES orgs(org_id),
  rel_to TEXT NOT NULL REFERENCES projects(prj_id),
  name_from TEXT,
  name_to TEXT,
  rel_class TEXT DEFAULT 'ORG-PRJ',
  rel_type TEXT,
  rel_direction TEXT DEFAULT 'Directed',
  rel_notes TEXT
);

-- PRJ-FND: Links projects to funding sources
CREATE TABLE prj_fnd (
  rel_id TEXT PRIMARY KEY,
  rel_from TEXT NOT NULL REFERENCES projects(prj_id),
  rel_to TEXT NOT NULL REFERENCES funding(fnd_id),
  name_from TEXT,
  name_to TEXT,
  rel_class TEXT DEFAULT 'PRJ-FND',
  rel_type TEXT,
  rel_direction TEXT DEFAULT 'Directed',
  rel_notes TEXT
);

-- ORG-FND: Links organizations to funding sources
CREATE TABLE org_fnd (
  rel_id TEXT PRIMARY KEY,
  rel_from TEXT NOT NULL REFERENCES orgs(org_id),
  rel_to TEXT NOT NULL REFERENCES funding(fnd_id),
  name_from TEXT,
  name_to TEXT,
  rel_class TEXT DEFAULT 'ORG-FND',
  rel_type TEXT,
  rel_direction TEXT DEFAULT 'Directed',
  rel_notes TEXT
);

-- ORG-IND: Links organizations to individuals (with role)
CREATE TABLE org_ind (
  rel_id TEXT PRIMARY KEY,
  rel_from TEXT NOT NULL REFERENCES orgs(org_id),
  rel_to TEXT NOT NULL REFERENCES individuals(ind_id),
  name_from TEXT,
  name_to TEXT,
  ind_role TEXT,                        -- e.g., 'Project Manager', 'Climate Coordinator'
  rel_class TEXT DEFAULT 'ORG-IND',
  rel_type TEXT,
  rel_direction TEXT DEFAULT 'Directed',
  rel_notes TEXT
);

-- ============================================================
-- INDEXES for common queries
-- ============================================================

CREATE INDEX idx_orgs_type ON orgs(org_type);
CREATE INDEX idx_docs_type ON docs(doc_type);
CREATE INDEX idx_docs_org_parent ON docs(org_parent);
CREATE INDEX idx_actions_sector ON actions(act_sector);
CREATE INDEX idx_actions_status ON actions(act_status);
CREATE INDEX idx_actions_spotlight ON actions(act_spotlight);
CREATE INDEX idx_projects_status ON projects(prj_status);

-- Junction table indexes for fast traversal
CREATE INDEX idx_org_org_from ON org_org(rel_from);
CREATE INDEX idx_org_org_to ON org_org(rel_to);
CREATE INDEX idx_doc_org_from ON doc_org(rel_from);
CREATE INDEX idx_doc_org_to ON doc_org(rel_to);
CREATE INDEX idx_act_doc_from ON act_doc(rel_from);
CREATE INDEX idx_act_doc_to ON act_doc(rel_to);
CREATE INDEX idx_act_trn_from ON act_trn(rel_from);
CREATE INDEX idx_act_trn_to ON act_trn(rel_to);
CREATE INDEX idx_trn_icr_from ON trn_icr(rel_from);
CREATE INDEX idx_trn_icr_to ON trn_icr(rel_to);
CREATE INDEX idx_org_res_from ON org_res(rel_from);
CREATE INDEX idx_org_res_to ON org_res(rel_to);
CREATE INDEX idx_act_prj_from ON act_prj(rel_from);
CREATE INDEX idx_act_prj_to ON act_prj(rel_to);
CREATE INDEX idx_org_prj_from ON org_prj(rel_from);
CREATE INDEX idx_org_prj_to ON org_prj(rel_to);
CREATE INDEX idx_prj_fnd_from ON prj_fnd(rel_from);
CREATE INDEX idx_prj_fnd_to ON prj_fnd(rel_to);
CREATE INDEX idx_org_fnd_from ON org_fnd(rel_from);
CREATE INDEX idx_org_fnd_to ON org_fnd(rel_to);
CREATE INDEX idx_org_ind_from ON org_ind(rel_from);
CREATE INDEX idx_org_ind_to ON org_ind(rel_to);

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER docs_updated_at BEFORE UPDATE ON docs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER actions_updated_at BEFORE UPDATE ON actions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER transitions_updated_at BEFORE UPDATE ON transitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER indicators_updated_at BEFORE UPDATE ON indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER funding_updated_at BEFORE UPDATE ON funding FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER individuals_updated_at BEFORE UPDATE ON individuals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
