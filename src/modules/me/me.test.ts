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

const loginMutation = (email: string, password: string) => `
mutation {
  login(email: "${email}", password: "${password}"){
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

describe("me tests", () => {
  test("return null if no coookie", async () => {
    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      }
    );

    expect(response.data.data).toEqual({ "me": null });
  })

  test("get Current User", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    )


    const response = await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      {
        withCredentials: true
      }
    )

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  })

})