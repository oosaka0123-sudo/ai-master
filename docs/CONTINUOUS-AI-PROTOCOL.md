# Continuous AI Protocol

Purpose: keep project work moving safely across ChatGPT, Gemini/Jules, Claude Code, Copilot and GitHub Actions without relying on one chat session.

## Core loop
1. GitHub Issue is the task contract and recovery point.
2. ChatGPT acts as PM/orchestrator: select the next safe task, gather external evidence, reconcile results, and make the merge/deploy decision.
3. Gemini acts as independent analyzer at checkpoints: inspect Issue/repository evidence, challenge assumptions, and output OBSERVED / EVIDENCE / HYPOTHESIS / CONFIDENCE / NEXT / RISK.
4. Claude Code or Jules is the single active implementer for one Issue and one branch.
5. GitHub Actions is the deterministic gate; Copilot or another independent reviewer is used when available.
6. After merge and live verification, the PM immediately selects or creates the next non-duplicate safe Issue instead of ending at an empty queue.

## Mandatory checkpoints
Run a three-role checkpoint when any of these is true: task start after a stop/restart; one milestone/Issue completes; context becomes long enough that handoff loss is plausible; CI/review fails twice for the same cause; evidence and implementation disagree; or before a higher-risk merge/deploy.

## Stopless behavior
A unavailable agent, quota limit, browser disconnect, or missing optional reviewer must not stop unrelated safe work. Record the blocker in the Issue, switch to another verified agent/tool, and continue. The PM may use a documented fallback review for low-risk changes when deterministic CI and source evidence are green. Human approval remains mandatory for secrets/credentials/IAM/billing, destructive or irreversible operations, repository deletion/visibility changes, force-push, and project-defined Human Gates.

## Resume algorithm
On every restart: read the project AGENTS.md / DECISIONS.md / RUNBOOK.md; inspect open `status:doing` Issues, open PRs, recent Actions and default-branch head; continue the most advanced valid task; never duplicate an existing Issue/branch/PR; if no active task exists, select the next safe backlog item and create an Issue.

## Completion evidence
Do not call a task complete until the applicable chain is verified: Implementation -> Test -> Review -> PR -> CI -> Merge -> Deploy -> Live Verification -> Documentation. Missing stages remain CURRENT/NEXT, not COMPLETED.

## Queue invariant
Normal state should have at most one implementation Issue in `status:doing` per project. Analysis/review may run in parallel only when it does not create competing implementation branches. On terminal completion, clear stale doing labels and immediately advance the next safe task.
