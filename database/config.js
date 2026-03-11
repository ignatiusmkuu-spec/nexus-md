const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const defaultSettings = {
  antilink: 'on',
  antilinkall: 'off',
  autobio: 'off',
  antidelete: 'on',
  antitag: 'on',
  antibot: 'off',
  anticall: 'off',
  badword: 'on',
  gptdm: 'off',
  welcome: 'off',
  autoread: 'off',
  mode: 'public',
  prefix: '.',
  autolike: 'on',
  autoview: 'on',
  wapresence: 'online'
};

async function initializeDatabase() {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let client;
    try {
      console.log(`📡 Connecting to PostgreSQL... (attempt ${attempt}/${MAX_RETRIES})`);
      client = await pool.connect();

      // Create table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS bot_settings (
          id SERIAL PRIMARY KEY,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL
        );
      `);

      // Seed defaults (skip if already present)
      for (const [key, value] of Object.entries(defaultSettings)) {
        await client.query(
          `INSERT INTO bot_settings (key, value)
           VALUES ($1, $2)
           ON CONFLICT (key) DO NOTHING;`,
          [key, value]
        );
      }

      console.log("✅ Database initialized.");
      return; // success — exit retry loop

    } catch (err) {
      console.error(`❌ DB init attempt ${attempt} failed:`, err.message || err);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY / 1000}s...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      } else {
        throw new Error(`Database initialization failed after ${MAX_RETRIES} attempts: ${err.message}`);
      }
    } finally {
      if (client) client.release();
    }
  }
}

async function getSettings() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT key, value FROM bot_settings WHERE key = ANY($1::text[])`,
      [Object.keys(defaultSettings)]
    );

    const settings = { ...defaultSettings }; // start with defaults
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }

    console.log("✅ Settings fetched from DB.");
    return settings;

  } catch (err) {
    console.error("❌ Failed to fetch settings:", err.message || err);
    return defaultSettings; // fallback to defaults so bot can still run

  } finally {
    if (client) client.release();
  }
}

async function updateSetting(key, value) {
  let client;
  try {
    const validKeys = Object.keys(defaultSettings);
    if (!validKeys.includes(key)) {
      throw new Error(`Invalid setting key: ${key}`);
    }

    client = await pool.connect();
    await client.query(
      `UPDATE bot_settings SET value = $1 WHERE key = $2`,
      [value, key]
    );

    try {
      const { invalidateCache } = require('./fetchSettings');
      invalidateCache();
    } catch (_) {}

    return true;
  } catch (err) {
    console.error("❌ Failed to update setting:", err.message || err);
    return false;
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  initializeDatabase,
  getSettings,
  updateSetting,
  pool
};
