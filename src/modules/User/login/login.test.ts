import { User } from '../../../entity/User';
import { invalidLogin, emailConfirmError } from './errorMessages';
import { createTypeormConnection} from '../../../utils/utils';
import { Connection } from 'typeorm';
import { TestClient } from '../../../utils/testClientUtil';

let loginTestConnection: Connection
beforeAll(async () => {
  loginTestConnection = await createTypeormConnection();
})

afterAll(async () => {
  loginTestConnection.close();
})

const testClient = new TestClient(process.env.TEST_HOST as string);

const loginErrorResponse = async (email, password, errorResponse) => {
  const response = await testClient.loginClient(email, password);
  expect(response.data).toEqual({ login: [{ path: 'Login', message: errorResponse }] })
}

test("tests logging in an invalid user should return invalid Login error", async () => {
  await loginErrorResponse("invalid@email.com", "invalidPassword", invalidLogin);
})

describe("testing login mutation for a valid user", () => {
  const email = "loging@test.com";
  const password = "logingTestPassword";
  it("with unconfirmed email", async () => {
    await testClient.registerClient(email, password);
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
    const response = await testClient.loginClient(email, password);
    expect(response.data).toEqual({ login: null });
  })
}) 