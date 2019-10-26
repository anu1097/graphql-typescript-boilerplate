import { confirmEmail } from './routes/confirmEmail';
import { Redis } from 'ioredis';
import { redisInstance } from './redis_utility';
import { getPort, generateMergedSchema } from './utils/utils';
import { createTypeormConnection } from './utils/utils';
import { GraphQLServer } from 'graphql-yoga';
import 'dotenv/config';

export const startServer = async () => {
  const redis: Redis = redisInstance;
  const server = new GraphQLServer({
    schema: generateMergedSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get('host')
    })
  });

  server.express.get("/confirm/:id", confirmEmail);
  await createTypeormConnection();
  const port = getPort();
  console.log(`Server is running on localhost:${port}`);
  const app = server.start({ port: port });
  return app;
}