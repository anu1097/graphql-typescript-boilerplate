import { resolvers } from './resolvers';
import { createTypeormConnection } from './utils/createTypeormConnection';
import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname + "/schema.graphql"));
  const server = new GraphQLServer({ typeDefs, resolvers })

  await createTypeormConnection();
  const port = process.env.NODE_ENV === 'test' ? 4001 : 4000
  console.log(`Server is running on localhost:${port}`);
  const app = server.start({ port: port });
  return app;
}