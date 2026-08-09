import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/sequelize';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getConnectionToken())
      .useValue(mockSequelize)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET) - success', () => {
    mockSequelize.authenticate.mockResolvedValueOnce(undefined);
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({
        status: 'ok',
        database: 'up',
      });
  });

  it('/api/health (GET) - database down', () => {
    mockSequelize.authenticate.mockRejectedValueOnce(new Error('Connection failed'));
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(503)
      .then((res) => {
        expect(res.body).toMatchObject({
          status: 'error',
          database: 'down',
        });
      });
  });
});
