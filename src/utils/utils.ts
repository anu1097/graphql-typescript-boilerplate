import { v4 } from "uuid";
import { Redis } from "ioredis";
import { getConnectionOptions, createConnection } from "typeorm"

export const getPort = (): number => {
  const port = process.env.NODE_ENV === 'test' ? 4001 : 4000;
  return port;
}

export const createEmailConfirmationLink = async (url: string, userId: string, redis: Redis) => {
  const uuid = v4();
  await redis.set(uuid, userId, "ex", 60 * 60 * 24);
  return `${url}/confirm/${uuid}`;
}


export const createTypeormConnection = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({
    ...connectionOptions, name: "default"
  });
}