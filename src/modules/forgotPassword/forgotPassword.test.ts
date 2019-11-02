import { removeAllUsersSession } from './../../utils/utils';
import { PASSWORD_NOT_LONG_ENOUGH, EXPIRED_KEY_ERROR } from './../../utils/commonErrors';
import { User } from '../../entity/User';
import { request } from 'graphql-request';
import { createTypeormConnection, createForgotPasswordLink } from '../../utils/utils';
import { Connection } from 'typeorm';
import { TestClient } from '../../utils/testClientUtil';
import * as Redis from 'ioredis';

let forgotPasswordTestConnection: Connection
let userId = '';
const email = "test@test.com";
const password = "testpassword";
beforeAll(async () => {
  forgotPasswordTestConnection = await createTypeormConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
})

afterAll(async () => {
  forgotPasswordTestConnection.close();
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

    await removeAllUsersSession(user.id, redis);
    //user should be logged out now
    expect(await testClient.meClient()).toEqual({
      data: {
        me: null
      }
    });

    const url = await createForgotPasswordLink('', user.id, redis);
    const paredData = url.split('/');
    const key = paredData[paredData.length - 1];
    expect(await testClient.forgotPasswordChange('a', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'newPassword',
            message: PASSWORD_NOT_LONG_ENOUGH
          }
        ]
      }
    });
    expect((await testClient.forgotPasswordChange(newPassword, key)).data).toEqual({
      forgotPasswordChange: null
    });
    expect((await testClient.forgotPasswordChange('asdasdasdas', key)).data).toEqual({
      forgotPasswordChange: [
        {
          path: "key",
          message: EXPIRED_KEY_ERROR
        }
      ]
    });
    expect(await testClient.loginClient(email, newPassword)).toEqual({
      data: {
        login: null
      }
    })
  })
}) 