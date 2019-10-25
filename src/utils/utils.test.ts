import { redisInstance } from './../redis_utility';
import { Connection } from 'typeorm';
import { User } from './../entity/User';
import { createEmailConfirmationLink } from './utils';
import { createTypeormConnection } from './utils';
import fetch from 'node-fetch';

let userId = ""
let conn: Connection

beforeAll(async () => {
  conn = await createTypeormConnection();
  const user = await User.create({
    email: "test@test.com",
    password: "password"
  }).save();
  userId = user.id;
})
afterAll(()=>{
  conn.close();
})

const redis = redisInstance;

describe("tests createConfirmEmail function", () => {
  it("checks if it sends correct response when valid url is hit", async () => {
    const confirmationUrl = await createEmailConfirmationLink(process.env.TEST_HOST as string, userId as string, redis);
    const response = await fetch(confirmationUrl);
    const responseText = await response.text();
    expect(responseText).toEqual("ok");
    
    const user = await User.findOne({where: {id: userId}});
    expect(user.confirmed).toBeTruthy();

    const id = await redis.get(userId);
    expect(id).toBeNull()
  })
})