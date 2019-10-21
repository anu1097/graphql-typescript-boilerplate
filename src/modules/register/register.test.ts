import { startServer } from '../../startServer';
import { User } from '../../entity/User';
import { request } from 'graphql-request'
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';

let getHost = () => ``;

beforeAll(async () => {
  await startServer();
  const port = process.env.NODE_ENV === 'test' ? 4001 : 4000;
  getHost = () => `http://127.0.0.1:${port}`;
})


const mutation = (email: string, password: string) => `
mutation {
  register(email: "${email}", password: "${password}"){
    path
    message
  }
}
`

describe("testing registration mutation", async () => {
  const email = "anu@anu.com";
  const password = "anu";
  it('registering a user returns correct response', async () => {
    const response = await request(getHost(), mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  })
  it('registering the same user twice returns incorrect response', async () => {
    const response = await request(getHost(), mutation(email, password));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    });
  })
  it('registering a user with invalid email returns inccorrect response', async () => {
    const response = await request(getHost(), mutation("an", password));
    expect(response.register).toHaveLength(2);
    expect(response).toEqual({
      register: [{ "message": emailNotLongEnough, "path": "email" }, { "message": invalidEmail, "path": "email" }]
    })
  })
  it('registering a user with invalid password returns inccorrect response', async () => {
    const response = await request(getHost(), mutation(email, "an"));
    expect(response.register).toHaveLength(1);
    expect(response).toEqual({
      register: [{ "path": "password", "message": passwordNotLongEnough }]
    })
  })
  it('registering a user with invalid email and invalid password returns inccorrect response', async () => {
    const response = await request(getHost(), mutation("an", "an"));
    expect(response.register).toHaveLength(3);
    expect(response).toEqual({
      register: [{ "message": emailNotLongEnough, "path": "email" }, { "message": invalidEmail, "path": "email" }, { "path": "password", "message": passwordNotLongEnough }]
    })
  })
})