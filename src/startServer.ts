import { Request } from 'node-fetch';
import { REDIS_SESSION_PREFIX } from './utils/constants';
import { confirmEmail } from './routes/confirmEmail';
import { Redis } from 'ioredis';
import { redisInstance } from './redis_utility';
import { getPort, generateMergedSchema } from './utils/utils';
import { createTypeormConnection } from './utils/utils';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import 'dotenv/config';
import "reflect-metadata";
import { expression } from '@babel/template';

const SESSION_SECRET = process.env.SESSION_SECRET;
const RedisStore = connectRedis(session);

export const startServer = async () => {
  const redis: Redis = redisInstance;
  const server = new GraphQLServer({
    schema: generateMergedSchema(),
    context: ({ request }) =>({
        redis,
        url: request.protocol + "://" + request.get('host'),
        req: request
      })
  });
  server.express.use(
    function(req, res, next) {
      res.header('Content-Type', 'application/json;charset=UTF-8')
      res.header('Access-Control-Allow-Credentials')
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      )
      next()
    },
    session({
      name: "qid",
      store: new RedisStore({
        client: redis as any,
        prefix: REDIS_SESSION_PREFIX
      }),
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  )

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : (process.env.FRONTEND_HOST as string)
  };

  server.express.get("/confirm/:id", confirmEmail);
  await createTypeormConnection();
  const port = getPort();
  console.log(`Server is running on localhost:${port}`);
  const app = server.start({
    port: port,
    cors
  });
  return app;
}