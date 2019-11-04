import * as faker from "faker";
import * as Redis from "ioredis";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { EXPIRED_KEY_ERROR, PASSWORD_NOT_LONG_ENOUGH } from "../../../utils/commonErrors";
import { TestClient } from "../../../utils/testClientUtil";
import { removeAllUsersSession } from "../../../utils/utils";
import { createForgotPasswordLink, createTypeormConnection } from "../../../utils/utils";

let forgotPasswordTestConnection: Connection;
let userId = "";
const email = faker.internet.email();
const password = faker.internet.password();
beforeAll(async () => {
	forgotPasswordTestConnection = await createTypeormConnection();
	const user = await User.create({
		confirmed: true,
		email,
		password,
	}).save();
	userId = user.id;
});

afterAll(async () => {
	forgotPasswordTestConnection.close();
});

const testClient = new TestClient(process.env.TEST_HOST as string);

const loginErrorResponse = async (e, p, errorResponse) => {
	const response = await testClient.loginClient(e, p);
	expect(response.data).toEqual({ login: [{ path: "Login", message: errorResponse }] });
};

const redis = new Redis();

describe("forgot password test", () => {
	it("making sure it works", async () => {
		const newPassword = "newPassword";
		const user = await User.findOne({
			where: { email },
		});

		await removeAllUsersSession(user.id, redis);
		// user should be logged out now
		expect(await testClient.meClient()).toEqual({
			data: {
				me: null,
			},
		});

		const url = await createForgotPasswordLink("", user.id, redis);
		const paredData = url.split("/");
		const key = paredData[paredData.length - 1];
		expect(await testClient.forgotPasswordChange("a", key)).toEqual({
			data: {
				forgotPasswordChange: [
					{
						message: PASSWORD_NOT_LONG_ENOUGH,
						path: "newPassword",
					},
				],
			},
		});
		expect((await testClient.forgotPasswordChange(newPassword, key)).data).toEqual({
			forgotPasswordChange: null,
		});
		expect((await testClient.forgotPasswordChange("asdasdasdas", key)).data).toEqual({
			forgotPasswordChange: [
				{
					message: EXPIRED_KEY_ERROR,
					path: "key",
				},
			],
		});
		expect(await testClient.loginClient(email, newPassword)).toEqual({
			data: {
				login: null,
			},
		});
	});
});
