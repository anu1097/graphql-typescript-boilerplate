import { passwordNotLongEnough } from './../../utils/commonErrors';
import { User } from '../../entity/User';
import { request } from 'graphql-request';
import { createTypeormConnection, createForgotPasswordLink } from '../../utils/utils';
import { Connection } from 'typeorm';
import { TestClient } from '../../utils/testClientUtil';
import * as Redis from 'ioredis';

let loginTestConnection: Connection
let userId = '';
const email = "forgotPassword@test.com";
const password = "forgotPassword";
beforeAll(async () => {
  loginTestConnection = await createTypeormConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
})

afterAll(async () => {
  loginTestConnection.close();
})

const testClient = new TestClient(process.env.TEST_HOST as string);

const loginErrorResponse = async (email, password, errorResponse) => {
  const response = await testClient.loginClient(email, password);
  expect(response.data).toEqual({ login: [{ path: 'Login', message: errorResponse }] })
}

const redis = new Redis;

describe("forgot password test", () => {
  it("making sure it works", async () => {
    const newPassword = 'newPassword';
    const user = await User.findOne({
      where: { email },
    })
    const url = await createForgotPasswordLink('', email, redis);

    //user should be logged out now
    const response = await testClient.meClient();
    expect(response).toEqual({
      me: null
    });

    const key = url;
    const response2 = await testClient.forgotPasswordChange('a', key);
    expect(response2).toEqual({
      data: {
        setNewPassword: {
          path: 'newPassword',
          message: passwordNotLongEnough
        }
      }
    });

    const response3 = await testClient.forgotPasswordChange(newPassword, key);
    expect(response3).toEqual({
      data: {
        setNewPassword: null
      }
    });

  })
}) 