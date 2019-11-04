import * as faker from "faker";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/testClientUtil";
import { createTypeormConnection } from "../../../utils/utils";

let meTestConnection: Connection;
let userId = "";
const email = faker.internet.email();
const password = faker.internet.password();

beforeAll(async () => {
	meTestConnection = await createTypeormConnection();
	const user = await User.create({
		confirmed: true,
		email,
		password,
	}).save();
	userId = user.id;
});

afterAll(async () => {
	meTestConnection.close();
});

describe("me tests", () => {
	const testClient = new TestClient(process.env.TEST_HOST as string);
	test("return null if no coookie", async () => {
		const response = await testClient.meClient();

		expect(response.data).toEqual({ me: null });
	});

	test("get Current User", async () => {

		await testClient.loginClient(email, password);

		const response = await testClient.meClient();

		expect(response.data).toEqual({
			me: {
				email,
				id: userId,
			},
		});
	});

});
