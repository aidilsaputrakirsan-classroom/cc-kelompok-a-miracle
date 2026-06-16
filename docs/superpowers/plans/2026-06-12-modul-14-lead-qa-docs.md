# Modul 14 Lead QA Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Lead QA & Docs evidence for Modul 14 observability and fix the helper script endpoint mismatch.

**Architecture:** Keep Modul 14 work documentation-first. Add one focused QA guide for observability validation, link it from existing project docs, then make the smallest script correction needed so documented commands match current gateway routes.

**Tech Stack:** Markdown docs, Docker Compose, FastAPI service endpoints, Nginx gateway, Bash/PowerShell helper scripts, pytest.

---

## File Structure

- Create `docs/observability-testing.md`: Lead QA & Docs guide for Modul 14 structured logging, correlation ID, metrics, alerting, and helper scripts.
- Modify `README.md`: add a short Modul 14 documentation link near the Milestone 2 docs area.
- Modify `CHANGELOG.md`: add Lead QA & Docs documentation entry for Modul 14.
- Modify `scripts/logs.sh`: change the donor metrics endpoint from stale `/items/metrics` to current `/pendonor/metrics`.

---

### Task 1: Add Modul 14 Observability QA Guide

**Files:**
- Create: `docs/observability-testing.md`

- [ ] **Step 1: Create observability QA documentation**

Create `docs/observability-testing.md` with sections for goal, components, test preparation, structured logging validation, correlation ID validation, metrics validation, alerting validation, helper script usage, result log, and QA checklist.

- [ ] **Step 2: Review content against implementation**

Check the doc references these actual files and endpoints:
- `services/auth-service/logging_middleware.py`
- `services/item-service/logging_middleware.py`
- `services/gateway/nginx.conf`
- `services/auth-service/metrics.py`
- `services/item-service/metrics.py`
- `scripts/logs.ps1`
- `scripts/logs.sh`
- `http://localhost/auth/metrics`
- `http://localhost/pendonor/metrics`

- [ ] **Step 3: Verify markdown file exists**

Run: `git diff -- docs/observability-testing.md`

Expected: diff shows only the new Modul 14 QA guide.

---

### Task 2: Link Modul 14 QA Docs From Project Docs

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add README link**

Add a short section after the Milestone 2 documentation block linking to `docs/observability-testing.md`.

- [ ] **Step 2: Add changelog entry**

Add an entry under version `2.0.0` noting that Lead QA & Docs documentation for Modul 14 observability was added.

- [ ] **Step 3: Verify links and diff**

Run: `git diff -- README.md CHANGELOG.md`

Expected: diff shows only README and CHANGELOG documentation link/entry changes.

---

### Task 3: Fix Bash Helper Metrics Endpoint

**Files:**
- Modify: `scripts/logs.sh`

- [ ] **Step 1: Confirm current mismatch**

Read `scripts/logs.sh` and confirm the metrics command uses `http://localhost/items/metrics` while the gateway config routes donor service through `/pendonor`.

- [ ] **Step 2: Update endpoint**

Change:

```bash
curl -s http://localhost/items/metrics | python3 -m json.tool
```

to:

```bash
curl -s http://localhost/pendonor/metrics | python3 -m json.tool
```

- [ ] **Step 3: Verify script diff**

Run: `git diff -- scripts/logs.sh`

Expected: one-line endpoint change from `/items/metrics` to `/pendonor/metrics`.

---

### Task 4: Verify QA Artifacts

**Files:**
- Read-only verification across changed files.

- [ ] **Step 1: Check working tree diff**

Run: `git diff -- docs/observability-testing.md README.md CHANGELOG.md scripts/logs.sh`

Expected: only intended Modul 14 QA docs/link/script changes appear.

- [ ] **Step 2: Run relevant unit tests if dependencies are available**

Run from `services/auth-service`: `python -m pytest tests/test_metrics_alerting.py -q`

Run from `services/item-service`: `python -m pytest tests/test_metrics_alerting.py -q`

Expected: both test files pass. If dependencies are missing, record the exact error and do not claim tests pass.

- [ ] **Step 3: Final status check**

Run: `git status --short`

Expected: changed files include the intended Modul 14 QA work plus any pre-existing user changes already present before this task.

---

## Self-Review

- Spec coverage: The plan covers Modul 14 QA documentation, README/CHANGELOG discoverability, and the helper script route mismatch.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: Paths and endpoints match the current repository structure and gateway routing.
