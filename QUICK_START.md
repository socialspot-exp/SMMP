# SMMP - Quick Start

## Live URLs

🌐 **Production:** https://app-socialspot-exps-projects.vercel.app
📦 **GitHub:** https://github.com/socialspot-exp/SMMP
🔧 **MCP Endpoint:** https://app-socialspot-exps-projects.vercel.app/api/mcp

## Local Development

```bash
npm run dev
```

Open http://localhost:3000

## Add MCP to Cursor

**Cursor Settings → Tools & MCP:**

1. **Supabase MCP:**
   - Name: `supabase`
   - Type: HTTP
   - URL: `https://mcp.supabase.com/mcp`

2. **Your Custom MCP:**
   - Name: `smmp-vercel`
   - Type: HTTP
   - URL: `https://app-socialspot-exps-projects.vercel.app/api/mcp`

Restart Cursor after adding.

## Environment Setup

Update `.env.local` with your Supabase credentials from https://supabase.com/dashboard

## Add Components

```bash
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
```

## Deploy Changes

```bash
git add -A
git commit -m "Your changes"
git push
```

Vercel auto-deploys on push to main.

---

See `README.md` for full documentation.
