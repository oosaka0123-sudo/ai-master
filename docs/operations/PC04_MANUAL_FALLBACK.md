# PC03 → PC04 Manual Fallback Runbook

Applies to the **public-project GitHub development workflow** when the user requests `04で進めて` or `03に戻して`.

## Operating contract

- **PC03** remains the primary local Windows execution node; **PC04 (ks04)** is the manually selected fallback. Do **not** build an automatic failover scheduler or switch accounts silently.
- Use the Remote Desktop Commander account **`info@rss7.net`** only when operating PC04. Select the connected ChatGPT account `いんふぉ０４` and its current Online `ks04` device. The old account's `ks04` and any Offline duplicate are not substitutes.
- Route to PC04 **only after** a user instruction to do so; `03に戻して` reverses the preferred device once PC03's required capabilities have been verified.
- GitHub is the source of truth for **pushed** work. It cannot attest to PC03's unpublished local changes.
- Keep PC03 and PC02 files, login sessions, services and hardware configuration unchanged unless specifically authorized for the required task. Never force-push, reset/clean, delete a worktree, or overwrite uncertain work.

## Starting a PC04 session

1. Read `ai-master/AGENTS.md`, `PROJECTS.md` and `CONNECT.md`. Resolve the requested public Project by its current repository; follow its own `AGENTS.md`, `README.md`, `HANDOFF.md`, open issues, PRs and latest Actions. Do not copy project-specific state into this master.
2. In the `info@rss7.net` RDC connection call `list_devices` and choose **Online ks04**. Test `ping` (if needed), `hostname` via terminal and `git --version`. If the selected device is Offline or the command fails, report that fact: do not fall back to an identically named device in another account.
3. Before changing local files, inspect the exact repo:
   ```powershell
   git -C <local-repo> status --porcelain=v1 -uall
   git -C <local-repo> branch -vv
   git -C <local-repo> rev-parse HEAD
   git -C <local-repo> remote -v
   ```
   Placeholder `<local-repo>` must be replaced by the project-specific verified absolute path. If dirty/untracked/unknown, preserve the files and choose another working directory or ask before editing.
4. If the repo is absent, clone the confirmed GitHub remote into a **new** work folder. If the repo is clean and remote is verified, `git fetch origin` and only fast-forward the intended branch with `git pull --ff-only`. Do not blindly checkout `main` or change the active branch of a pre-existing workspace.
5. Work on a new project-specific branch. Run the **project's** tests with its documented environment (for `ai-master/line-control` in PowerShell, set `$env:NODE_ENV='test'` before `node --test`). Obtain independent Claude/Gemini reviews through their **actual CLI** when the task's required review level calls for them; verify both tool login and real model responses, never simulate reviewers.

## GitHub write path that does not require local Git authentication

The following path has been end-to-end demonstrated and is the preferred fallback while PC04's Git Credential Manager is unauthenticated:

1. Make approved changes using the connected **GitHub connector** on a new branch.
2. Inspect diff and run appropriate tests or CI; use PR review and merge only when repository rules allow it.
3. On PC04 **check the worktree is clean**, then `git fetch` and `git pull --ff-only` on the verified branch.
4. Verify matching commit IDs, a clean worktree, and relevant tests. Report the PR and verification evidence.

The GitHub connector's write access **does not** prove PC04's `git push` credentials are installed. Local push is optional for this documented workflow; a direct `git push` requires an independently confirmed, user-authorized authentication flow.

## PC03 unpublished-work boundary (no shortcut)

When PC03's RDC quota has been exhausted, that **does not** imply that its disks or workspaces are empty or migrated. TCP22 reachability alone is not SSH login. Even a host key obtained from the first unauthenticated connection must be independently verified before trusting the host.

To assert **full handoff**, an authorized PC03 session must first inventory each *relevant* repository/worktree (read-only):

```powershell
git status --porcelain=v1 -uall
git branch -vv
git stash list
git log --branches --not --remotes --oneline
git worktree list
```

Also check intentionally ignored or non-Git local assets required by the project **without disclosing secrets**. If anything unpublished is present, safely back it up and reconcile it to PC04 using an authorized method (reviewed work branch / encrypted approved transfer), verify hashes and commits, then run project-specific tests. Never assume no changes based on GitHub alone. Do not publicize private repository names or contents in this public master.

PC04's fallback SSH client may be PuTTY/Plink, but the PC03 login and host-key authentication have **not** been validated. Do not disable host verification or guess/store passwords. PC03's local data must remain untouched until authorized access is available.

## Windows startup and account isolation

- The current PC04 startup configuration includes `DesktopCommanderRemote.vbs` and `Start-DesktopCommanderRemote.ps1`. Live tests demonstrated a single running remote process and that a repeated launcher invocation skipped starting a duplicate.
- Those tests **do not** establish persistence after Windows sign-out, reboot, or a future login. Coordinate an actual sign-out/sign-in test with the user before claiming that.
- PC04 credentials are scoped to the `info@rss7.net` connection. Never copy credentials, tokens, private keys or device session files from PC03 or an older RDC account.

## Acceptance and status terms

- **PC04 fallback GitHub development: VERIFIED** only if Online RDC, repo fetch/clone, GitHub connector PR/merge (if changes needed), PC04 fast-forward sync, clean status, and project tests are evidenced for the specific task.
- **PC03 full local migration: PENDING** until the relevant PC03 unpublished work and external assets have been safely inventoried and reconciled.
- **Windows restart resilience: PENDING** until an actual sign-out/sign-in or reboot recovery test succeeds.
- A completed three-model review is **advice**, not proof that missing remote credentials or unpublished code were transferred.
