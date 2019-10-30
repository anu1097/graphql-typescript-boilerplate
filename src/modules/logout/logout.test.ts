import { User } from '../../entity/User';
import { createTypeormConnection, TestClient } from '../../utils/utils';
import { Connection } from 'typeorm';
import axios from 'axios';

let userId = '';
const email = "loging@test.com";
const password = "logingTestPassword";

beforeAll(async () => {
  await createTypeormConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
})

const testClient = new TestClient(process.env.TEST_HOST as string);

describe("logout tests", () => {

  test("after logging out a user, me query returns null", async () => {
    await testClient.loginClient(email, password);

    const response = await testClient.meClient();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await testClient.logoutClient();

    const response2 = await testClient.meClient();

    expect(response2.data.me).toBeNull();
  })
})