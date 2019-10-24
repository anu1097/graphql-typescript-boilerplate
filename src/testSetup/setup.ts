import { createTypeormConnection } from './../utils/createTypeormConnection';
import { startServer } from './../startServer';

export const globalJestSetup = async () => {
  await startServer();
  const port = process.env.NODE_ENV === 'test' ? 4001 : 4000;
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;
};

