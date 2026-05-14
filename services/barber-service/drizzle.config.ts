import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/barber.db',
  },
};

export default config;
