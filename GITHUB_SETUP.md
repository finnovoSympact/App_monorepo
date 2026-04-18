# GitHub setup — personal repo

One-shot commands to put this scaffold on GitHub under your personal account.

## 1) Authenticate the GitHub CLI (one-time)

```bash
gh auth status || gh auth login
```

Pick HTTPS → authenticate via browser → grant `repo` and `workflow`.

## 2) Push this scaffold (paste once)

Run from inside the `finnovo/` directory:

```bash
export REPO=finnovo            # rename tomorrow if you want to rebrand

git init
git add .
git commit -m "feat: scaffold multi-agent finance copilot"
git branch -M main

# Create a private repo under your personal account and push.
gh repo create "$REPO" --private --source=. --remote=origin --push

# Seed CI secrets. Paste the key when prompted; press enter to skip an optional one.
gh secret set ANTHROPIC_API_KEY
gh secret set OPENAI_API_KEY || true
```

## 3) Add teammates (optional)

Swap in their GitHub handles:

```bash
gh api -X PUT "repos/$(gh api user --jq .login)/$REPO/collaborators/TEAMMATE_HANDLE" -f permission=push
```

## 4) Hook up Vercel (do this before hour 20)

```bash
pnpm dlx vercel@latest link --project "$REPO" --yes
pnpm dlx vercel@latest env add ANTHROPIC_API_KEY production
pnpm dlx vercel@latest env add OPENAI_API_KEY production || true
pnpm dlx vercel@latest --prod
```

Vercel auto-reads the repo from GitHub and deploys on every push. Use this as a **secondary** demo URL — your primary demo is still `pnpm dev` on your laptop.

## 5) Hackathon-handy labels (paste once)

```bash
for lbl in "demo-blocker,#d73a4a" "polish,#a2eeef" "agent,#7057ff" "finance,#008672" "post-demo,#ededed"; do
  name="${lbl%%,*}"; color="${lbl##*,}"
  gh label create "$name" --color "${color#\#}" --force
done
```

## 6) If you want to move to an org later

When the project graduates, transfer with:

```bash
gh repo transfer "$(gh api user --jq .login)/$REPO" NEW-ORG-NAME
```

No code changes needed — git remote updates automatically on next push.
