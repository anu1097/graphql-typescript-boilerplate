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


describe("logout tests", () => {

  test("multipe session logout", async () => {
    const testClient1 = new TestClient(process.env.TEST_HOST as string);
    const testClient2 = new TestClient(process.env.TEST_HOST as string);

    await testClient1.loginClient(email, password);
    await testClient2.loginClient(email, password);

    let response1 = await testClient1.meClient();
    let response2 = await testClient2.meClient();

    expect(response1).toEqual(response2);

    await testClient1.logoutClient();
    response1 = await testClient1.meClient();
    response2 = await testClient2.meClient();
    expect(response1.data.me).toEqual(response2.data.me);
  })

  test("single session after logging out a user, me query returns null", async () => {
    const testClient = new TestClient(process.env.TEST_HOST as string);
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