import { request } from 'graphql-request';
import { GraphQlMiddleware, Resolver } from './../types/graphql-utils';
import { v4 } from "uuid";
import { Redis } from "ioredis";
import { getConnectionOptions, createConnection } from "typeorm"
import { importSchema } from 'graphql-import';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import * as path from 'path';
import * as fs from 'fs';
import { FORGOT_PASSWORD_PREFIX } from './constants';

export const getPort = (): number => process.env.NODE_ENV === 'test' ? 4001 : 4000;

export const createEmailConfirmationLink = async (url: string, userId: string, redis: Redis) => {
  const uuid = v4();
  await redis.set(uuid, userId, "ex", 60 * 60 * 24);
  return `${url}/confirm/${uuid}`;
}

export const createForgotPasswordLink = async (url: string, userId: string, redis: Redis) => {
  const uuid = v4();
  await redis.set(`${FORGOT_PASSWORD_PREFIX}${uuid}`, userId, "ex", 20 * 60 );
  return `${url}/change-password/${uuid}`;
}

export const createTypeormConnection = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({
    ...connectionOptions, name: "default"
  });
}

export const generateMergedSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname + "/../modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(path.join(__dirname + `/../modules/${folder}/schema.graphql`));
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  })
  return mergeSchemas({ schemas })
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