// @ts-nocheck
import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: 'prisma/schema.prisma',
  },
  migrate: {
    connection: {
      kind: 'direct',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});
