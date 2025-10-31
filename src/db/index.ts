import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";
import { env } from "@/env";
// biome-ignore lint/performance/noNamespaceImport: TODO: fix this in a future
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;
// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
neonConfig.poolQueryViaFetch = true;

const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql, schema });
