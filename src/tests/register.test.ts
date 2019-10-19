import { startServer } from './../startServer';
import { User } from './../entity/User';
import { request } from 'graphql-request'

let getHost = () => ``;

beforeAll(async () => {
  const app = await startServer();
  const port = process.env.NODE_ENV === 'test' ? 4001 : 4000;
  getHost = () => `http://127.0.0.1:${port}`;
})

const email = "anu@anu1.com";
const password = "anu";

const mutation = `
mutation {
  register(email: "${email}", password: "${password}")
}
`

test('registering a user returns correct response', async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
})