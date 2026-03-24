# MCP Server Setup Guide

This project is configured with MCP servers for Supabase and Vercel integration.

## Supabase MCP Server

The Supabase MCP server is a hosted service that connects your AI tools to Supabase.

### Setup in Cursor

1. Open Cursor Settings (Cmd+,)
2. Navigate to **Cursor Settings > Tools & MCP**
3. Click **Add MCP Server**
4. Add the following configuration:

**Server Name:** `supabase`
**Server Type:** HTTP
**URL:** `https://mcp.supabase.com/mcp`

Optional parameters you can add to the URL:
- `?read_only=true` - Execute all queries as read-only
- `?project_ref=YOUR_PROJECT_REF` - Scope to specific project
- `?features=database,docs` - Enable only specific tool groups

Example: `https://mcp.supabase.com/mcp?read_only=true&project_ref=abc123`

5. Save and restart Cursor
6. The MCP client will redirect you to log in to Supabase
7. Grant access to your organization
8. Verify by asking: "What tables are in my database? Use MCP tools."

### Available Tools

- **Database:** list_tables, execute_sql, list_migrations, apply_migration
- **Debugging:** get_logs, get_advisors
- **Development:** get_project_url, get_publishable_keys, generate_typescript_types
- **Edge Functions:** list_edge_functions, deploy_edge_function
- **Docs:** search_docs

### Security Best Practices

- Use with development projects only, NOT production
- Enable read-only mode for safer operations
- Scope to specific projects using project_ref
- Always review tool calls before executing
- Use branching feature for safe testing

## Vercel MCP Integration

For Vercel, the `mcp-handler` package is already installed in this project. This allows you to create custom MCP endpoints in your Next.js app.

### Creating a Custom MCP Endpoint

Create an API route at `src/app/api/mcp/route.ts`:

```typescript
import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const handler = createMcpHandler({
  name: 'my-vercel-mcp',
  version: '1.0.0',
  tools: [
    {
      name: 'example_tool',
      description: 'An example tool',
      inputSchema: z.object({
        message: z.string(),
      }),
      handler: async ({ message }) => {
        return { result: `You said: ${message}` }
      },
    },
  ],
})

export { handler as GET, handler as POST }
```

### Deploying to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow prompts to deploy
4. Your MCP endpoint will be available at: `https://your-app.vercel.app/api/mcp`

### Using Vercel MCP in Cursor

After deployment, add to Cursor MCP settings:

**Server Name:** `vercel`
**Server Type:** HTTP
**URL:** `https://your-app.vercel.app/api/mcp`

## Environment Variables

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

## Resources

- Supabase MCP: https://supabase.com/mcp
- Supabase MCP GitHub: https://github.com/supabase-community/supabase-mcp
- Vercel MCP Handler: https://github.com/vercel/mcp-handler
- MCP Documentation: https://modelcontextprotocol.io/
