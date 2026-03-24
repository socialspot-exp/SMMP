# SMMP - Next.js + TypeScript + shadcn/ui + MCP

Modern Next.js application with TypeScript, shadcn/ui components, and MCP server integrations for Supabase and Vercel.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Supabase** - Backend as a service (database, auth, storage)
- **MCP Servers** - Model Context Protocol for AI tool integration

## Getting Started

### Prerequisites

- Node.js 18+ (you have v22.11.0)
- npm or yarn
- Supabase account (for database features)
- Vercel account (for deployment)

### Installation

Dependencies are already installed. To reinstall:

```bash
cd app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API

## shadcn/ui Components

shadcn/ui is initialized with default settings. Add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
```

Browse components: [ui.shadcn.com](https://ui.shadcn.com)

## MCP Server Setup

### Supabase MCP (Hosted)

The Supabase MCP server is a hosted service that gives AI tools direct access to your Supabase projects.

**Setup in Cursor:**

1. Open Cursor Settings (Cmd+, or Ctrl+,)
2. Go to **Cursor Settings > Tools & MCP**
3. Click **Add MCP Server**
4. Configure:
   - **Name:** `supabase`
   - **Type:** HTTP
   - **URL:** `https://mcp.supabase.com/mcp`
   
   Optional URL parameters:
   - `?read_only=true` - Read-only mode (recommended for production)
   - `?project_ref=YOUR_REF` - Scope to specific project
   - `?features=database,docs` - Enable specific tool groups

5. Save and restart Cursor
6. Browser window opens for Supabase login
7. Grant access to your organization
8. Test: Ask Cursor "List my Supabase tables using MCP"

**Available Tools:**
- Database operations (list_tables, execute_sql, migrations)
- Logs and debugging (get_logs, get_advisors)
- Edge Functions (list, deploy)
- TypeScript type generation
- Documentation search

**Security:**
- Use with development projects only
- Enable read-only mode when possible
- Always review tool calls before execution
- Scope to specific projects

### Vercel MCP (Custom Endpoint)

This project includes a custom MCP endpoint at `/api/mcp` using `mcp-handler`.

**Local Development:**

The MCP endpoint is available at `http://localhost:3000/api/mcp` when running `npm run dev`.

**After Deployment:**

1. Deploy to Vercel: `vercel` or push to GitHub with Vercel integration
2. Your MCP endpoint: `https://your-app.vercel.app/api/mcp`
3. Add to Cursor MCP settings:
   - **Name:** `vercel-custom`
   - **Type:** HTTP
   - **URL:** `https://your-app.vercel.app/api/mcp`

**Customizing Tools:**

Edit `src/app/api/mcp/route.ts` to add your own tools. Example:

```typescript
{
  name: 'deploy_status',
  description: 'Check deployment status',
  inputSchema: z.object({
    deploymentId: z.string(),
  }),
  handler: async ({ deploymentId }) => {
    // Your Vercel API logic here
    return { status: 'success' }
  },
}
```

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── mcp/
│   │   │       └── route.ts      # Custom MCP endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/                   # shadcn components
│   │       └── button.tsx
│   └── lib/
│       ├── utils.ts              # shadcn utilities
│       └── supabase.ts           # Supabase client
├── .env.local                    # Environment variables
├── components.json               # shadcn config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Add shadcn components
npx shadcn@latest add [component-name]

# Deploy to Vercel
vercel
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase MCP](https://supabase.com/mcp)
- [Vercel MCP Handler](https://github.com/vercel/mcp-handler)
- [Model Context Protocol](https://modelcontextprotocol.io/)
