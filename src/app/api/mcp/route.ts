import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'get_deployment_info',
      {
        title: 'Get Deployment Info',
        description: 'Get information about Vercel deployments',
        inputSchema: {
          projectName: z.string().optional(),
        },
      },
      async ({ projectName }) => {
        return {
          content: [
            {
              type: 'text',
              text: `Deployment info for project: ${projectName || 'default'}. Implement your Vercel API logic here.`,
            },
          ],
        }
      }
    )

    server.registerTool(
      'query_database',
      {
        title: 'Query Database',
        description: 'Query Supabase database',
        inputSchema: {
          query: z.string(),
        },
      },
      async ({ query }) => {
        return {
          content: [
            {
              type: 'text',
              text: `Query: ${query}. Implement your Supabase query logic here.`,
            },
          ],
        }
      }
    )
  },
  {},
  {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: true,
  }
)

export { handler as GET, handler as POST }
