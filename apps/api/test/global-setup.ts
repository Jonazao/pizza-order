import { Sequelize } from 'sequelize-typescript';
import { readdirSync } from 'fs';
import { join } from 'path';

// pg ships no bundled types and @types/pg is not installed, so require() it.
const { Client } = require('pg');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

const DEV_DB_NAME = process.env.DB_NAME || 'pizza';
const TEST_DB_NAME = process.env.TEST_DB_NAME || 'pizza_test';

async function setup(): Promise<void> {
  if (TEST_DB_NAME === DEV_DB_NAME) {
    throw new Error(
      `Refusing to run e2e setup against the dev database "${DEV_DB_NAME}". ` +
        'Set TEST_DB_NAME to a dedicated test database.',
    );
  }

  // 1. (Re)create the test database on the running Postgres instance.
  const admin = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
  });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}" WITH (FORCE)`);
  await admin.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
  await admin.end();

  // 2. Apply migrations and seeders in dependency order.
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: TEST_DB_NAME,
    logging: false,
  });

  try {
    const runSteps = async (dir: string): Promise<void> => {
      const steps = readdirSync(dir).filter((file) => file.endsWith('.ts')).sort();
      for (const step of steps) {
        const module = require(join(dir, step));
        await module.up(sequelize.getQueryInterface());
      }
    };

    await runSteps(join(__dirname, '..', 'database', 'migrations'));
    await runSteps(join(__dirname, '..', 'database', 'seeders'));
  } finally {
    await sequelize.close();
  }
}

export = setup;
