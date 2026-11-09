require("dotenv").config();
const fs = require("node:fs/promises");
const path = require("node:path");
const pool = require("../src/configs/database");
const inTransaction = require("../src/shared/transaction");

async function migrate() {
  await inTransaction(async client => {
    await client.query("SELECT pg_advisory_xact_lock(49281723)");
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    const directory = path.join(__dirname, "../migrations");
    for (const file of (await fs.readdir(directory)).filter(name => name.endsWith(".sql")).sort()) {
      const applied = await client.query("SELECT name FROM schema_migrations WHERE name = $1", [file]);
      if (applied.rowCount) continue;
      await client.query(await fs.readFile(path.join(directory, file), "utf8"));
      await client.query("INSERT INTO schema_migrations(name) VALUES ($1)", [file]);
      console.log(`Migração aplicada: ${file}`);
    }
  });
}

if (require.main === module) {
  migrate().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
}
module.exports = migrate;
