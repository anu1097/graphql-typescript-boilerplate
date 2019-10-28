import fetch from 'node-fetch';
import { User } from './../../entity/User';
import { invalidLogin, emailConfirmError } from './errorMessages';
import { request } from 'graphql-request';
import { createTypeormConnection } from './../../utils/utils';
import { Connection } from 'typeorm';
import axios from 'axios';
import { shouldInclude } from 'apollo-utilities';

let loginTestConnection: Connection
beforeAll(async () => {
  loginTestConnection = await createTypeormConnection();
})

afterAll(async () => {
  loginTestConnection.close();
})

const mutation = (mutationName: string, email: string, password: string) => `
mutation {
  ${mutationName}(email: "${email}", password: "${password}"){
    path
    message
  }
}
`

const meQuery = `
{
  me{
    id
    email
  }
}
`;

const loginErrorResponse = async (email, password, errorResponse) => {
  const response = await request(process.env.TEST_HOST as string, mutation("login", email, password));
  expect(response).toEqual({ login: [{ path: 'Login', message: errorResponse }] })
}

test("tests logging in an invalid user should return invalid Login error", async () => {
  await loginErrorResponse("invalid@email.com", "invalidPassword", invalidLogin);
})

describe("testing login mutation for a valid user", () => {
  const email = "loging@test.com";
  const password = "logingTestPassword";
  it("with unconfirmed email", async () => {
    await request(process.env.TEST_HOST as string, mutation("register", email, password));
    const user = await User.findOne({
      where: { email },
    })
    await loginErrorResponse(email, password, emailConfirmError);
  })
  it("with incorrect password", async () => {
    await User.update({ email }, { confirmed: true });
    await loginErrorResponse(email, "invalidPassword", invalidLogin);
  })
  it("with confirmed email", async () => {
    const response = await request(process.env.TEST_HOST as string, mutation("login", email, password));
    expect(response).toEqual({ login: null });
  })
})