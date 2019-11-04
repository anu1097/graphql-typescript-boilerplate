import { GraphQlMiddleware, Resolver } from './../types/graphql-utils';
import { v4 } from "uuid";
import { Redis } from "ioredis";
import { getConnectionOptions, createConnection } from "typeorm"
import { makeExecutableSchema } from 'graphql-tools';
import { FORGOT_PASSWORD_PREFIX, USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from './constants';
import * as path from 'path';
import * as fs from 'fs';
import { mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import * as glob from "glob";

export const getPort = (): number => process.env.NODE_ENV === 'test' ? 4001 : 4000;

export const createEmailConfirmationLink = async (url: string, userId: string, redis: Redis) => {
  const uuid = v4();
  await redis.set(uuid, userId, "ex", 60 * 60 * 24);
  return `${url}/confirm/${uuid}`;
}

export const createForgotPasswordLink = async (url: string, userId: string, redis: Redis) => {
  const uuid = v4();
  await redis.set(`${FORGOT_PASSWORD_PREFIX}${uuid}`, userId, "ex", 20 * 60);
  return `${url}/change-password/${uuid}`;
}

export const createTypeormConnection = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({
    ...connectionOptions, name: "default"
  });
}

export const createTestConnection = async (resetDB: boolean = false) => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({
    ...connectionOptions, 
    name: "default",
    synchronize: resetDB,
    dropSchema: resetDB
  });
}

export const removeAllUsersSession = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(`${USER_SESSION_ID_PREFIX}${userId}`, 0, -1)

  const promises = [];
  sessionIds.forEach(sessionId => {
    promises.push(redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`));
  });
  await Promise.all(promises);
}

export const generateMergedSchema = () => {
  const pathToModules = path.join(__dirname, "../modules");
  const graphqlTypes = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(x => fs.readFileSync(x, { encoding: "utf8" }));

  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(resolver => require(resolver).resolvers);
  return makeExecutableSchema({
    typeDefs: mergeTypes(graphqlTypes),
    resolvers: mergeResolvers(resolvers)
  });
}

export const createMiddleWare = (
  middleWare: GraphQlMiddleware,
  resolverFunc: Resolver
) => (
  parent: any,
  args: any,
  context: any,
  info: any
) => middleWare(resolverFunc, parent, args, context, info);

export const middleWare = async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  //user not logged in
  if (!context.req || !context.req.session.userId) {
    return null;
  }
  const response = await resolver(parent, args, context, info);
  return response;
}