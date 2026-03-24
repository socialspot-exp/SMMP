# Quick MCP Setup for Cursor

## Add Supabase MCP Server

1. Open Cursor Settings: `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
2. Navigate to: **Cursor Settings > Tools & MCP**
3. Click: **Add MCP Server**
4. Enter:
   - **Name:** `supabase`
   - **Type:** `HTTP`
   - **URL:** `https://mcp.supabase.com/mcp`
5. Click **Save**
6. Restart Cursor
7. Browser opens → Log in to Supabase → Grant access
8. Test: Ask Cursor "List my Supabase tables using MCP tools"

### Optional URL Parameters

Add to the URL for additional configuration:

- Read-only mode: `https://mcp.supabase.com/mcp?read_only=true`
- Specific project: `https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF`
- Limited features: `https://mcp.supabase.com/mcp?features=database,docs`

## Add Custom Vercel MCP Server (After Deployment)

1. Deploy your app to Vercel first
2. Open Cursor Settings: `Cmd+,` or `Ctrl+,`
3. Navigate to: **Cursor Settings > Tools & MCP**
4. Click: **Add MCP Server**
5. Enter:
   - **Name:** `vercel-custom`
   - **Type:** `HTTP`
   - **URL:** `https://your-app.vercel.app/api/mcp`
6. Click **Save**
7. Restart Cursor

## Deploy to Vercel

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy from app directory
cd app
vercel

# Follow prompts
```

Your app will be deployed and you'll get a URL like `https://your-app.vercel.app`

## Supabase Setup

1. Create account: [supabase.com](https://supabase.com)
2. Create new project
3. Go to: Settings → API
4. Copy:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)
5. Paste into `app/.env.local`

## Test Installation

```bash
cd app
npm run dev
```

Visit `http://localhost:3000` - you should see the Next.js welcome page.

## Next Steps

- Add shadcn components: `npx shadcn@latest add [component]`
- Set up Supabase tables and auth
- Customize MCP tools in `src/app/api/mcp/route.ts`
- Deploy to Vercel
- Connect Cursor to both MCP servers
