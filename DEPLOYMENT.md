# Deployment Information

## GitHub Repository
**URL:** https://github.com/socialspot-exp/SMMP

## Vercel Deployment
**Production URL:** https://app-socialspot-exps-projects.vercel.app

**Alternative URLs:**
- https://app-phi-woad-39.vercel.app
- https://app-socialspot-exp-socialspot-exps-projects.vercel.app

**MCP Endpoint:** https://app-socialspot-exps-projects.vercel.app/api/mcp

## Quick Links

- **Live App:** https://app-socialspot-exps-projects.vercel.app
- **GitHub Repo:** https://github.com/socialspot-exp/SMMP
- **Vercel Dashboard:** https://vercel.com/socialspot-exps-projects/app

## Add MCP Servers to Cursor

### 1. Supabase MCP (Hosted)

Open Cursor Settings → Tools & MCP → Add:
- **Name:** `supabase`
- **Type:** `HTTP`
- **URL:** `https://mcp.supabase.com/mcp`

### 2. Your Custom Vercel MCP

Open Cursor Settings → Tools & MCP → Add:
- **Name:** `smmp-vercel`
- **Type:** `HTTP`
- **URL:** `https://app-socialspot-exps-projects.vercel.app/api/mcp`

## Redeploy

```bash
cd app
git add -A
git commit -m "Your changes"
git push
vercel --prod
```

Or just push to GitHub - Vercel auto-deploys on push.

## Environment Variables

Add to Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
