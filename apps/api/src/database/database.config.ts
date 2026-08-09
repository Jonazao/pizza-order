import { SequelizeModuleOptions } from '@nestjs/sequelize';

const config = {
  dialect: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'pizza',
  autoLoadModels: true,
  synchronize: false, // Ensure schema synchronization is disabled
};

export const databaseConfig: SequelizeModuleOptions = {
  ...config,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};

// For Sequelize CLI compatibility
module.exports = {
  databaseConfig,
  development: {
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    seederStorage: 'sequelize',
  },
  production: {
    dialect: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    seederStorage: 'sequelize',
  },
};
