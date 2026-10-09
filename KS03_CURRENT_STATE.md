# KS03 Current State

Last verified: 2026-10-09 JST

## Role

- `ks-03` is the Primary Local Windows Execution Node.
- Cloud First remains higher priority. Use `ks-03` when local Windows execution is genuinely required.
- `ks-pc02` is being retired for sale and is no longer the preferred local node.

## KS03 operational state

- Remote Desktop Commander: working
- Tailscale: working
- Windows OpenSSH: Running / Automatic
- Claude Code: authenticated and tested
- GitHub CLI / Git HTTPS: authenticated and tested
- Google Cloud CLI: authenticated
- Firebase CLI: project access verified
- Antigravity CLI / Gemini: authenticated and tested
- Antigravity remote-control: working
- 24x7 Guard: working
- KS03 Watchdog: working
- Windows automatic login: intentionally disabled
- After reboot, Windows may remain at the sign-in screen until manual sign-in.
- User-session tools start after manual Windows sign-in.

## KS-PC02 -> KS03 migration

Migration copy completed and verified on 2026-10-09.

- 18 local-only / dirty / unpushed workspaces were archived on KS-PC02, transferred to KS03 through Tailscale, and SHA-256 verified 18/18.
- Recovered workspaces:
  `C:\Users\oosaka\Documents\recovered-from-ks-pc02`
- Transfer archives:
  `C:\Users\oosaka\Documents\02-to-03-migration`
- KS video / voice tools restored:
  `C:\Users\oosaka\Desktop\KS_CapCut`
  `C:\Users\oosaka\Desktop\KS-Voice-Test`
- Old KS-PC02 hard-coded user paths in five KS_CapCut Python scripts were adjusted for KS03 and syntax-checked.
- KS avatar image assets and Edge bookmarks were preserved.
- Opera Browser Connector / Browser Operator 5.2.0 packages were transferred and hash-verified.
- Opera Connector final activation still requires Opera account sign-in and enabling “Allow AI connection”.

## Intentionally not copied

- GitHub App private-key PEM
- Browser cookies
- Saved-password databases
- Active browser sessions
- Full browser profiles
- Claude / Codex / Gemini credential/session folders
- Desktop Commander device identity
- Tailscale device identity
- Opera recovery/session backups
- Reproducible `node_modules`

## Before selling KS-PC02

Do not wipe or sell KS-PC02 until all of the following are complete:

1. Confirm/revoke/reissue the GitHub App private key that remains on KS-PC02.
2. Sign out / revoke remaining browser and service sessions as appropriate.
3. Confirm Opera Browser Connector is activated on KS03 if it is still needed.
4. Only then perform a full Windows reset / secure wipe of KS-PC02.

## Local evidence on KS03

- `C:\Users\oosaka\Documents\ks-03\SETUP_STATUS.txt`
- `C:\Users\oosaka\Documents\recovered-from-ks-pc02\MIGRATION-REPORT.txt`
- Desktop shortcut: `Recovered-from-KS-PC02.lnk`

No secret values, tokens, account identifiers, or private-key material are stored in this file.
