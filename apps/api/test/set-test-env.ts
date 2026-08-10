// Must be imported before AppModule so ConfigModule / dotenv do not override these.
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'pizza_test';
