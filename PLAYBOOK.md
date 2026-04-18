# Sanad — hackathon playbook (3-layer, spec-locked)

**Hard deadline:** 🔒 **Sunday 2026-04-19 08:00** (submission form closes, access revoked).
**Presentation slot:** Sunday 2026-04-19 starting 09:00.
**Pitch format:** 5 min deck (8 sections) + 2 min recorded video demo + 20 min Q&A.

> **Product scope reminder.** Sanad has three layers sharing one Postgres. Not three products — one platform.
> - **L1 Sanad Chat** — WhatsApp-style individual onboarding + SME escalation.
> - **L2 Daiyn** — SME credit pipeline (5-node LangGraph with HITL on every node) + signed Passport.
> - **L3 Sanad for Banks** — Matched lead feed + action dispatcher + commission ledger.
>
> **Demo-day scope (honest labeling for judges):**
> - L2 is **fully functional** end-to-end.
> - L1 is **fully functional as a simulator** at `/chat`; real WhatsApp API is behind `WHATSAPP_LIVE=1` flag (not demoed).
> - L3 is **lightweight-functional**: real DB writes, real matching, stubbed outbound send.

## Deliverables — upload checklist

All three must be uploaded to the team's designated Drive folder, with ownership granted to **aiesec.tunisie.carthage@gmail.com**, before 08:00 Sunday. Then fill the form: https://forms.gle/Vv9GpgZL3PAc25VB8

- [ ] **GitHub repo link** (public or collaborator access for judges).
- [ ] **Deck** — `deck/sanad.pdf` exported from `deck/sanad.md` via Marp. 8 slides, 5 min.
- [ ] **Demo video** — `deck/demo-video.mp4`. 2 min max. Subtitle file `deck/demo-video.srt` alongside.
- [ ] **Drive ownership transferred** to aiesec.tunisie.carthage@gmail.com on every uploaded file.
- [ ] **Form submitted** with all three links.

⚠️ Spec is explicit: submissions missing the ownership transfer or filed after 08:00 **may be disqualified**. Do the upload + ownership transfer by **07:00 Sunday** — give yourself an hour of buffer.

## The 20-hour runway — 3-layer reality check

Assuming spec-book intake is Saturday morning and upload is Sunday 07:00:

| Hour | Block | Deliverable | Layers touched |
|---|---|---|---|
| H0 | Spec intake → PROMPTS.md §0 pre-flight installs | Deps installed, dirs scaffolded, Ed25519 keys generated | — |
| H0-H1 | PROMPTS.md §1 rebrand Finnovo → Sanad (Daiyn kept for L2) | Brand hierarchy clean across repo | all |
| H1-H2 | PROMPTS.md §2 Drizzle schema all 3 layers + infra | `drizzle-kit generate` green, one migration file | all |
| H2-H3 | PROMPTS.md §3 seed: 3 SME packs + 3 chat personas + 2 bank criteria + canned trace | Seed data loaded, dev DB playable | all |
| H3-H6 | PROMPTS.md §4 Layer-2 5-node pipeline (Formatter/Orch/Exec/Reviewer/Finalizer) + HITL interrupts + SSE | `/playground` shows pipeline running with HITL on every node | L2 |
| H6-H7 | PROMPTS.md §5 Layer-2 UI (upload, pipeline-graph, hitl-panel) | Upload → run → approve/refine flow feels pitch-grade | L2 |
| H7-H8 | PROMPTS.md §6 Sanad Passport (Ed25519 sign + `/passport/[id]` + `/verify/[id]`) | QR-verifiable Passport end-to-end | L2 |
| H8-H10 | PROMPTS.md §7 Layer-1 `/chat` simulator + persona switcher + offline replay | WhatsApp-style chat visibly working with 3 personas | L1 |
| H10-H11 | PROMPTS.md §8 Layer-1 backend (conversational agent + tools + escalator + real API behind flag) | Tool calls visible; `raiseSMESignal` → magic-link promotion flow works | L1 |
| H11-H12 | PROMPTS.md §9 Layer-3 dashboard + matching engine + action dispatcher + commission ledger | Bank login shows lead feed; click contact → event logged | L3 |
| H12-H13 | PROMPTS.md §10 Landing page (3-layer story, 3 CTAs) | `/` tells the story cleanly | all |
| **H13** | **🚨 FEATURE FREEZE** | No new files after this hour | — |
| H13-H14 | Live-model wire-up behind `DAIYN_LIVE_MODELS=1` on a branch; if flaky, keep flag OFF | Offline canned trace is the canonical demo path | L2 |
| H14-H15 | Polish pass: cost+latency HUD, trace panel visuals, toast/sound on approval | UI is pitch-grade | all |
| H15-H17 | PROMPTS.md §11 deck (8 slides per spec) + speaker notes | `deck/sanad.md` → Marp → PDF | — |
| H17-H19 | **Record demo video** (PROMPTS.md §12) | `deck/demo-video.mp4` ≤120s + `.srt` | all |
| H19-H21 | PROMPTS.md §13 reviewer pass — fix blockers only. Q&A rehearsal against IDEAS.md defense bank | Blockers fixed; rebuttals memorized | all |
| H21-H23 | Deck rehearsal w/ timer. Stage deliverables in Drive. Confirm ownership transfer works | Three files in Drive, owner = aiesec.tunisie.carthage@gmail.com | — |
| H23-H24 | Submit at 07:00 (upload + transfer ownership + form) | Confirmation email screenshotted | — |
| 09:00 | Present | Laptop mirrored, backup video on USB | — |

**Time-boxed commitments:**
- If H3-H6 runs long, cut the Reviewer's "block-on-missing-source" rule to a warning. Keep 5 nodes, keep HITL.
- If H8-H11 runs long, drop the real Meta API wire-up entirely. Simulator is fine on its own — it's the demo surface.
- If H11-H12 runs long, drop outbound dispatch visuals — keep the feed, matching badges, and commission ledger chart.

## Pre-event checklist (before spec book drops)

- [ ] Repo cloned on the laptop you'll demo from. `pnpm install` green. Node 22+.
- [ ] `pnpm dev` loads `/`, `/playground`, `/chat` without errors.
- [ ] `.env.local` has `ANTHROPIC_API_KEY`. BYOK alternatives (OpenRouter/Groq/Gemini/Together) ready if quota issue.
- [ ] `PASSPORT_SIGNING_KEY_PRIVATE` / `_PUBLIC` generated and loaded.
- [ ] `WHATSAPP_LIVE=0` in `.env.local` (the default; don't touch).
- [ ] Postgres: Neon free tier project created; `DATABASE_URL` in `.env.local`; `drizzle-kit push` successful.
- [ ] `claude` CLI installed and auth'd.
- [ ] `gh` CLI auth'd. Repo already on personal GitHub per GITHUB_SETUP.md.
- [ ] OBS installed, mic tested, 1920×1080 scene configured.
- [ ] CapCut or DaVinci Resolve installed for editing.
- [ ] Marp CLI: `npx @marp-team/marp-cli --version` works.
- [ ] Google Drive folder access confirmed; test-upload a dummy file; confirm ownership-transfer flow.
- [ ] Team aligned on submission form: https://forms.gle/Vv9GpgZL3PAc25VB8 bookmarked.
- [ ] Phone hotspot tested. Two adapters, two chargers.

## H0-H1 — spec intake

1. Drop the spec PDF in `/spec/`.
2. Paste PROMPTS.md §0 into Claude Code. Let it install deps, scaffold directories, generate Ed25519 keys.
3. Commit: `chore: spec intake + pre-flight installs`.
4. If spec mandates a pivot (IDEAS.md insurance policies), swap names and proceed — do NOT rebuild.

## H1-H3 — data foundation (rebrand + schema + seed)

Hand-off of prompts in sequence: §1 rebrand → §2 schema → §3 seed. **Do NOT touch UI until the DB is green and seed data loads.** This is the critical-path foundation.

Freeze point: `pnpm -s tsc --noEmit` clean, `drizzle-kit generate` green, seed script runs idempotent.

## H3-H8 — Layer 2 vertical slice

§4 pipeline → §5 UI → §6 Passport. This is the hero demo moment and gets the most hours. Do not proceed to L1/L3 until the 5-node pipeline runs against at least one seed pack end-to-end with HITL on every node working.

## H8-H12 — Layer 1 + Layer 3

§7 + §8 (Layer 1) in parallel mental thread with §9 (Layer 3). They don't share code; they only share the DB. Order by ROI: L1 chat first (it's the opening of the demo video), L3 second.

## H12-H13 — landing page + feature freeze

§10 landing page with 3 CTAs. Anything not working by H13 will NOT ship. Write it on a sticky note.

## H13-H15 — polish + live-model test

Switch `DAIYN_LIVE_MODELS=1` on a branch and test L2 pipeline with real Sonnet calls. If <3 failures per 5 runs, keep flag on for demo. Else keep OFF — canned trace is canonical.

Add: cost+latency HUD, success toast/sound on final Passport issuance, smooth transition animations on the pipeline graph.

## H15-H17 — deck

Run §11. 8 slides per spec: Problème, Solution, Produit, Taille du marché, Concurrents, Impact, Équipe, Besoins.

Speaker notes with a timer: target 35s per slide = 4:40 total, leaving buffer.

Export: `npx @marp-team/marp-cli deck/sanad.md --pdf --allow-local-files -o deck/sanad.pdf`.

## H17-H19 — record the demo video (do not skip sleep yet)

Run §12 to produce the shot list. Then:

- Close every app except Chrome + OBS. Silence notifications system-wide.
- Start `pnpm dev`. Navigate to the demo URLs. Use `?offline=1` on `/playground` for deterministic timing.
- Record in one take if possible; else scene-by-scene and cut in CapCut.
- Audio: read the VO cleanly, not rushed. French, professional register.
- Target 115-120s. Hard cap 120s per spec.
- Export H.264, CRF 18, 1080p 60fps, AAC 192k audio.
- Generate SRT subtitles: auto-caption in CapCut and correct, or write manually.

Upload to Drive. Transfer ownership to aiesec.tunisie.carthage@gmail.com.

## H19-H21 — reviewer pass + Q&A rehearsal

Run PROMPTS.md §13 reviewer. Fix every Blocker. Accept the rest.

Open IDEAS.md "Shark-Tank defense bank" and rehearse every answer with a teammate. Drill the 3-layer questions especially (they're most likely in a 20-min Q&A):
- "Isn't three layers too much?"
- "Which layer is the real product?"
- "Why WhatsApp and not an app?"
- "HITL on every node — won't that slow things down?"
- "What if no bank signs up?"
- "One database for all three — is that safe?"

## H21-H23 — deck rehearsal + submission prep

Run the deck twice on the demo laptop with timer. Adjust.
Stage all three deliverables in the Drive folder. Confirm ownership transfer. Record screenshots of the share dialog showing aiesec.tunisie.carthage@gmail.com as owner.

## H23-H24 — submit at 07:00, not 07:59

- [ ] Final commit pushed to GitHub.
- [ ] Repo visibility correct (public, or collaborator access for judges per spec).
- [ ] Deck PDF uploaded, owner transferred.
- [ ] Demo video uploaded, owner transferred.
- [ ] Form submitted: https://forms.gle/Vv9GpgZL3PAc25VB8
- [ ] Screenshot the confirmation email / form response as proof.

Then sleep for 1 hour before 09:00 presentation.

## 09:00 — presentation

- Laptop on the table, mirrored to projector.
- Deck open in Marp preview (full-screen) on one desktop, demo video queued on another.
- Spec-compliant flow: open with deck (5 min), transition to demo video (2 min, **play from local file** — do NOT rely on Drive streaming), then Q&A (20 min).
- During Q&A: one team member fields the question, others stay silent. No panel-answering.
- Open IDEAS.md defense bank on a phone or second screen for Q&A reference.
- Close with an explicit ask: bank pilot partner + BCT sandbox intros.

## Anti-patterns (do not do these)

- **Refactoring at hour 14.** The code is not the product. The demo video is.
- **Demoing live instead of video.** The spec REQUIRES the recorded video. Don't improvise live on stage.
- **Uploading at 07:55.** Upload at 07:00. Drive sometimes takes minutes to process ownership transfers.
- **Trying real bank API integrations.** Mocked open banking is honest and spec-compliant. Don't risk it.
- **Real Meta WhatsApp API during demo.** Meta approval takes weeks. Use the simulator. `WHATSAPP_LIVE=0` stays the default.
- **Rebuilding the landing page at hour 22.** §10 runs at hour 12-13. Leave it alone after that.
- **Adding a fourth layer.** Three is the spec. Anything more is cognitive overload.
- **Adding a feature you haven't rehearsed.** If it's not in the video script, cut it from the product.
- **Skipping the ownership transfer.** Spec is explicit that this may cause disqualification.

## Emergency plan

- **Internet down during dev:** offline replay (`/playground?offline=1`, `/chat?offline=1`) — demo-critical flows work without network.
- **Provider outage during dev:** BYOK fallback — OpenRouter/Groq/Gemini/Together pre-wired in `.env.example`.
- **Postgres unreachable:** local Docker Postgres fallback; schema migrates fresh in <1 min.
- **Drive access issue Sunday morning:** upload to a second Drive account as backup; share link in the form with a note. Spec allows the form to be the final source of truth for links.
- **Demo video fails to export:** you have the full raw footage; deliver scene-1 (Layer 1) + scene-3 (Layer 2 pipeline) at 60s minimum as a last resort.
- **Laptop dies during presentation:** backup deck + video on a USB stick, taped to the inside of the laptop lid.
- **Mid-demo, a layer breaks on stage:** the video has already been played; live improvisation isn't required. If asked to improvise during Q&A, fall back to `/playground?offline=1` which never fails.
