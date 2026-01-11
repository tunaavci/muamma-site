import { z } from 'zod';
import { insertQuestionSchema, insertUserSchema, questions, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  questions: {
    listPublic: {
      method: 'GET' as const,
      path: '/api/questions',
      responses: {
        200: z.array(z.custom<typeof questions.$inferSelect>()),
      },
    },
    listAll: { // Admin only
      method: 'GET' as const,
      path: '/api/admin/questions',
      responses: {
        200: z.array(z.custom<typeof questions.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/questions',
      input: insertQuestionSchema,
      responses: {
        201: z.custom<typeof questions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/admin/questions/:id/status',
      input: z.object({ status: z.enum(["pending", "approved", "rejected"]) }),
      responses: {
        200: z.custom<typeof questions.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/questions/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: insertUserSchema,
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
