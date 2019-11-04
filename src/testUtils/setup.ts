import { startServer } from "./../startServer";
import { createTypeormConnection } from "./../utils/utils";

export const globalJestSetup = async () => {
	if (!process.env.TEST_HOST) {
		await startServer();
	}
	const port = process.env.NODE_ENV === "test" ? 4001 : 4000;
	process.env.TEST_HOST = `http://127.0.0.1:${port}`;
};
