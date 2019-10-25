import { confirmEmail } from './routes/confirmEmail';
import { Redis } from 'ioredis';
import { redisInstance } from './redis_utility';
import { getPort } from './utils/utils';
import { createTypeormConnection } from './utils/utils';
import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname + "/modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname + `/modules/${folder}/schema.graphql`));
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  })
  const redis: Redis = redisInstance;
  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
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