import { redisInstance } from './../redis_utility';
import { Connection } from 'typeorm';
import { User } from './../entity/User';
import { createEmailConfirmationLink } from './utils';
import { createTypeormConnection } from './utils';
import fetch from 'node-fetch';

let userId = "";
let confirmationUrl = "";
let utilsTestConnection: Connection;

beforeAll(async () => {
  utilsTestConnection = await createTypeormConnection();
  const user = await User.create({
    email: "testUtil@test.com",
    password: "testUtilPassword"
  }).save();
  userId = user.id;
  confirmationUrl = await createEmailConfirmationLink(process.env.TEST_HOST as string, userId as string, redis);
})
afterAll(async () => {
  utilsTestConnection.close();
})

const redis = redisInstance;

describe("tests createConfirmEmail function", () => {
  it("checks if it sends correct response when valid url is hit", async () => {
    const response = await fetch(confirmationUrl);
    const responseText = await response.text();
    expect(responseText).toEqual("ok");
  });
  it("checks if user is confirmed", async () => {
    const user = await User.findOne({ where: { id: userId } });
    expect(user.confirmed).toBeTruthy();
    const id = await redis.get(userId);
    expect(id).toBeNull()
  });
  it("checks if it sends correct response when valid url is hit again", async () => {
    const response2 = await fetch(confirmationUrl);
    const responseText2 = await response2.text();
    expect(responseText2).toEqual("UserId invalid");
  });
})