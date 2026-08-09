import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { HEALTH_ROUTES } from './routes';

@ApiTags('Health')
@Controller(HEALTH_ROUTES.base)
export class HealthController {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check API and Database connectivity' })
  @ApiResponse({ status: 200, description: 'System healthy and database up' })
  @ApiResponse({ status: 503, description: 'Database connectivity down' })
  async getHealth() {
    try {
      // Direct PostgreSQL query check
      await this.sequelize.authenticate();
      return {
        status: 'ok',
        database: 'up',
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    }
  }
}
