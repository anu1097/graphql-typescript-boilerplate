import { User } from './entity/User';
import { getPort } from './utils/utils';
import { createTypeormConnection } from './utils/createTypeormConnection';
import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import * as Redis from 'ioredis';

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname + "/modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname + `/modules/${folder}/schema.graphql`));
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  })
  const redis = new Redis();
  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get('host')
    })
  });

  server.express.get("/confirm/:id", async (req, res) => {
    const {id} = req.params;
    const userID = await redis.get(id);
    if(userID){
      User.update({id: userID}, {confirmed: true})
      redis.del(userID);
      res.send("ok")
    }
    else{
      res.send("UserId invalid")
    }
  })

  await createTypeormConnection();
  const port = getPort();
  console.log(`Server is running on localhost:${port}`);
  const app = server.start({ port: port });
  return app;
}