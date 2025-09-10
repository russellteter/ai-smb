import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

function buildFallbackUrl(dbName: string): string | null {
  const user = process.env.USER || process.env.LOGNAME;
  if (!user) return null;
  return `postgres://${user}@localhost:5432/${dbName}`;
}

async function main() {
  let databaseUrl = process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    const fb = buildFallbackUrl('mothership');
    if (fb) {
      databaseUrl = fb;
      console.log(`DATABASE_URL not set, using fallback ${fb}`);
    } else {
      console.error('DATABASE_URL not set and no fallback user found');
      process.exit(1);
    }
  }

  // Attempt to connect; if DB missing, create it
  let client: Client | null = null;
  try {
    client = new Client({ connectionString: databaseUrl });
    await client.connect();
  } catch (err: any) {
    if (err?.code === '3D000') {
      // database does not exist → create it using best-effort admin connection
      const original = new URL(databaseUrl);
      const dbName = original.pathname.replace('/', '') || 'mothership';
      // Try admin connect with provided creds to 'postgres'
      let adminUrl = new URL(databaseUrl);
      adminUrl.pathname = '/postgres';
      let admin: Client | null = null;
      try {
        admin = new Client({ connectionString: adminUrl.toString() });
        await admin.connect();
      } catch (e) {
        // Fallback to OS user without password
        const fbAdmin = buildFallbackUrl('postgres');
        if (!fbAdmin) throw e;
        admin = new Client({ connectionString: fbAdmin });
        await admin.connect();
      }
      await admin.query(`CREATE DATABASE ${dbName}`);
      await admin.end();
      client = new Client({ connectionString: databaseUrl });
      await client.connect();
    } else if (err?.code === '28000') {
      // role does not exist → try fallback user
      const fb = buildFallbackUrl('mothership');
      if (!fb) throw err;
      databaseUrl = fb;
      client = new Client({ connectionString: databaseUrl });
      await client.connect();
    } else {
      throw err;
    }
  }

  // Minimal bootstrap run: create tables via SQL snapshot for MVP
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const sqlPath = path.join(__dirname, 'sql', '001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await client!.query(sql);
  await client!.end();
  console.log('Migrations applied');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


