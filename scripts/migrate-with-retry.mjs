#!/usr/bin/env node
/**
 * Wait for Postgres, clear a stuck failed init migration if needed, then migrate deploy.
 */
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 30;
const DELAY_MS = 2000;
const FAILED_INIT = "20260807100000_init_postgresql";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function migrateDeploy() {
  try {
    const output = execSync("npx prisma migrate deploy", {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
    });
    if (output) process.stdout.write(output);
    return { ok: true, output: output ?? "" };
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    if (output) process.stdout.write(output);
    return { ok: false, output };
  }
}

function resetPublicSchema() {
  console.warn(
    "Resetting public schema to clear partial/failed migration state (fresh deploy recovery)...",
  );
  execSync("npx prisma db execute --stdin", {
    input: "DROP SCHEMA IF EXISTS public CASCADE;\nCREATE SCHEMA public;\n",
    stdio: ["pipe", "inherit", "inherit"],
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is missing. On Railway, set it on the app service to ${{Postgres.DATABASE_URL}}.",
    );
    process.exit(1);
  }

  execSync("npx prisma generate", { stdio: "inherit" });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`Running migrations (attempt ${attempt}/${MAX_ATTEMPTS})...`);
    const result = migrateDeploy();
    if (result.ok) {
      console.log("Migrations applied.");
      return;
    }

    const output = result.output;

    if (output.includes("P3009") || output.includes("failed migrations")) {
      console.warn(`Detected failed migration record. Recovering ${FAILED_INIT}...`);
      try {
        execSync(`npx prisma migrate resolve --rolled-back "${FAILED_INIT}"`, {
          stdio: "inherit",
        });
      } catch {
        // Record may already be cleared.
      }

      try {
        resetPublicSchema();
      } catch (resetError) {
        console.error(
          "Could not reset public schema:",
          resetError.message ?? resetError,
        );
        process.exit(1);
      }

      const retry = migrateDeploy();
      if (retry.ok) {
        console.log("Migrations applied after recovery.");
        return;
      }
      console.error(retry.output);
      process.exit(1);
    }

    if (
      output.includes("P1001") ||
      output.includes("Can't reach database") ||
      output.includes("ECONNREFUSED") ||
      output.includes("not yet accepting")
    ) {
      if (attempt === MAX_ATTEMPTS) {
        console.error(
          "Could not reach the database after multiple attempts.\n" +
            "Check Railway: Postgres is Running, same project/environment, and DATABASE_URL is correct.",
        );
        process.exit(1);
      }
      console.warn(`Database not ready yet. Retrying in ${DELAY_MS / 1000}s...`);
      await sleep(DELAY_MS);
      continue;
    }

    console.error(output || "prisma migrate deploy failed");
    process.exit(1);
  }
}

main();
