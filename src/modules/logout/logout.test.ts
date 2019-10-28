import { User } from '../../entity/User';
import { createTypeormConnection } from '../../utils/utils';
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

const logoutMutation = `
mutation{
  logout
}
`

describe("logout tests", () => {

  test("after logging out a user, me query returns null", async () => {
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

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation
      },
      {
        withCredentials: true
      }
    )

      const response2 = await axios.post(
        process.env.TEST_HOST as string,
        { query: meQuery },
        {
          withCredentials: true
        }
        )

        expect(response2.data.data.me).toBeNull();
  })
})