import { emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './../../utils/commonErrors';
import { createTypeormConnection } from './../../utils/utils';
import { User } from '../../entity/User';
import { request } from 'graphql-request'
import { duplicateEmail} from './errorMessages';
import { Connection } from 'typeorm';

beforeAll(async () => {
 await createTypeormConnection();
})

const registerMutation = (email: string, password: string) => `
mutation {
  register(email: "${email}", password: "${password}"){
    path
    message
  }
}
`

describe("testing registration mutation", () => {
  const email = "register@test.com";
  const password = "registerTestPassword";
  it('registering a user returns correct response', async () => {
    const response = await request(process.env.TEST_HOST as string, registerMutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  })
  it('registering the same user twice returns incorrect response', async () => {
    const response = await request(process.env.TEST_HOST as string, registerMutation(email, password));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    });
  });
  it('registering a user with invalid email returns inccorrect response', async () => {
    const response = await request(process.env.TEST_HOST as string, registerMutation("an", password));
    expect(response.register).toHaveLength(2);
    expect(response).toEqual({
      register: [{ "message": emailNotLongEnough, "path": "email" }, { "message": invalidEmail, "path": "email" }]
    })
  })
  it('registering a user with invalid password returns inccorrect response', async () => {
    const response = await request(process.env.TEST_HOST as string, registerMutation(email, "an"));
    expect(response.register).toHaveLength(1);
    expect(response).toEqual({
      register: [{ "path": "password", "message": passwordNotLongEnough }]
    })
  })
  it('registering a user with invalid email and invalid password returns inccorrect response', async () => {
    const response = await request(process.env.TEST_HOST as string, registerMutation("an", "an"));
    expect(response.register).toHaveLength(3);
    expect(response).toEqual({
      register: [{ "message": emailNotLongEnough, "path": "email" }, { "message": invalidEmail, "path": "email" }, { "path": "password", "message": passwordNotLongEnough }]
    })
  })
})