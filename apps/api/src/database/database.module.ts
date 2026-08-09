import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './database.config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...databaseConfig,
        host: configService.get<string>('DB_HOST', databaseConfig.host as string),
        port: parseInt(configService.get<string>('DB_PORT', String(databaseConfig.port)), 10),
        username: configService.get<string>('DB_USER', databaseConfig.username as string),
        password: configService.get<string>('DB_PASSWORD', databaseConfig.password as string),
        database: configService.get<string>('DB_NAME', databaseConfig.database as string),
      }),
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
