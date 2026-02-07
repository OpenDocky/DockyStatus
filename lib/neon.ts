import { Pool } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL (or NEON_DATABASE_URL) is not set");
}

// Reuse a single pool across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _neonPool: Pool | undefined;
}

export const pool = global._neonPool ?? new Pool({ connectionString, max: 5 });

if (!global._neonPool) {
  global._neonPool = pool;
}

export async function query<T = any>(text: string, params?: any[]) {
  return pool.query<T>(text, params);
}
