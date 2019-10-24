import * as Redis from 'ioredis';
import { User } from './../entity/User';
import { createEmailConfirmationLink } from './utils';
import { createTypeormConnection } from './createTypeormConnection';
import fetch from 'node-fetch';

let userId = ""

beforeAll(async () => {
  await createTypeormConnection();
  const user = await User.create({
    email: "test@test.com",
    password: "password"
  }).save();
  userId = user.id;
})

const redis = new Redis();

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

  it("checks if it sends incorrect response when invalid url is hit", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/12312312`);
    const responseText = await response.text();
    expect(responseText).toEqual("UserId invalid");
  })

})