import { TestClient } from './../../utils/utils';
import { User } from './../../entity/User';
import { request } from 'graphql-request';
import { createTypeormConnection } from '../../utils/utils';
import { Connection } from 'typeorm';
import axios from 'axios';

let meTestConnection: Connection
let userId = '';
const email = "loging@test.com";
const password = "logingTestPassword";

beforeAll(async () => {
  meTestConnection = await createTypeormConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
})

afterAll(async () => {
  meTestConnection.close();
})

describe("me tests", () => {
  const testClient = new TestClient(process.env.TEST_HOST as string);
  test("return null if no coookie", async () => {
    const response = await testClient.meClient();

    expect(response.data).toEqual({ "me": null });
  })

  test("get Current User", async () => {
    
    await testClient.loginClient(email, password);
  
    const response = await testClient.meClient();
  
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  })

})