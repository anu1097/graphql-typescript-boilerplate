import { EMAIL_NOT_LONG_ENOUGH, INVALID_EMAIL, PASSWORD_NOT_LONG_ENOUGH } from './../../utils/commonErrors';
import { createTypeormConnection } from './../../utils/utils';
import { User } from '../../entity/User';
import { duplicateEmail } from './errorMessages';
import { Connection } from 'typeorm';
import { TestClient } from '../../utils/testClientUtil';

let registerTestConnection: Connection

beforeAll(async () => {
  registerTestConnection = await createTypeormConnection();
})

afterAll(async () => {
  registerTestConnection.close();
})

const testClient = new TestClient(process.env.TEST_HOST as string);

describe("testing registration mutation", () => {
  const email = "register@test.com";
  const password = "registerTestPassword";
  it('registering a user returns correct response', async () => {
    const response = await testClient.registerClient(email, password);
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  })
  it('registering the same user twice returns incorrect response', async () => {
    const response = await testClient.registerClient(email, password);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    });
  });
  it('registering a user with invalid email returns inccorrect response', async () => {
    const response = await testClient.registerClient("an", password);
    expect(response.data.register).toHaveLength(2);
    expect(response.data).toEqual({
      register: [{ "message": EMAIL_NOT_LONG_ENOUGH, "path": "email" }, { "message": INVALID_EMAIL, "path": "email" }]
    })
  })
  it('registering a user with invalid password returns inccorrect response', async () => {
    const response = await testClient.registerClient(email, "an");
    expect(response.data.register).toHaveLength(1);
    expect(response.data).toEqual({
      register: [{ "path": "password", "message": PASSWORD_NOT_LONG_ENOUGH }]
    })
  })
  it('registering a user with invalid email and invalid password returns inccorrect response', async () => {
    const response = await testClient.registerClient("an", "an");
    expect(response.data.register).toHaveLength(3);
    expect(response.data).toEqual({
      register: [{ "message": EMAIL_NOT_LONG_ENOUGH, "path": "email" }, { "message": INVALID_EMAIL, "path": "email" }, { "path": "password", "message": PASSWORD_NOT_LONG_ENOUGH }]
    })
  })
})