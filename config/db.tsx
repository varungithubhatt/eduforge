import { drizzle } from 'drizzle-orm/neon-http';

export const db = drizzle(process.env.DATABASE_CONNECTION_STRING!);
