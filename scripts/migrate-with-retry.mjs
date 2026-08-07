#!/usr/bin/env node
/**
 * Wait for Postgres to accept connections, then run prisma migrate deploy.
 * Railway private networking can be briefly unavailable right after deploy.
 */
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 30;
const DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is missing. On Railway, set it on the app service to ${{Postgres.DATABASE_URL}} (or DATABASE_PUBLIC_URL).",
    );
    process.exit(1);
  }

  execSync("npx prisma generate", { stdio: "inherit" });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`Running migrations (attempt ${attempt}/${MAX_ATTEMPTS})...`);
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("Migrations applied.");
      return;
    } catch {
      if (attempt === MAX_ATTEMPTS) {
        console.error(
          "Could not reach the database after multiple attempts.\n" +
            "Check Railway: Postgres service is Running, both services are in the same project/environment,\n" +
            "and DATABASE_URL is set on the app service. If private networking fails, try:\n" +
            "  DATABASE_URL=${{Postgres.DATABASE_PUBLIC_URL}}",
        );
        process.exit(1);
      }
      console.warn(`Database not ready yet. Retrying in ${DELAY_MS / 1000}s...`);
      await sleep(DELAY_MS);
    }
  }
}

main();
