import * as connectRedis from "connect-redis";
import "dotenv/config";
import * as RateLimit from "express-rate-limit";
import * as session from "express-session";
import { GraphQLServer } from "graphql-yoga";
import { Redis } from "ioredis";
import * as RedisStoreProvider from "rate-limit-redis";
import "reflect-metadata";
import { redisInstance } from "./redis_utility";
import { confirmEmail } from "./routes/confirmEmail";
import { REDIS_SESSION_PREFIX } from "./utils/constants";
import {
	createTypeormConnection,
	generateMergedSchema,
	getPort,
} from "./utils/utils";

const SESSION_SECRET = process.env.SESSION_SECRET;
const RedisStore = connectRedis(session);

export const startServer = async () => {
	if (process.env.NODE_ENV === "test") {
		await redisInstance.flushall();
	}
	const redis: Redis = redisInstance;
	const server = new GraphQLServer({
		context: ({ request }) => ({
			redis,
			req: request,
			url: request.protocol + "://" + request.get("host"),
		}),
		schema: generateMergedSchema(),
	});

	//  apply to all requests
	server.express.use(
		new RateLimit({
			max: 100, // limit each IP to 100 requests per windowMs
			store: new RedisStoreProvider({
				client: redisInstance,
			}),
			windowMs: 15 * 60 * 1000, // 15 minutes
		}),
	);
	server.express.use(
		(req, res, next) => {
			res.header("Content-Type", "application/json;charset=UTF-8");
			res.header("Access-Control-Allow-Credentials");
			res.header(
				"Access-Control-Allow-Headers",
				"Origin, X-Requested-With, Content-Type, Accept",
			);
			next();
		},
		session({
			cookie: {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24 * 7,
				secure: process.env.NODE_ENV === "production",
			},
			name: "qid",
			resave: false,
			saveUninitialized: false,
			secret: SESSION_SECRET,
			store: new RedisStore({
				client: redis as any,
				prefix: REDIS_SESSION_PREFIX,
			}),
		}),
	);

	const cors = {
		credentials: true,
		origin: process.env.NODE_ENV === "test" ? "*" : (process.env.FRONTEND_HOST as string),
	};

	server.express.get("/confirm/:id", confirmEmail);
	await createTypeormConnection();
	const port = getPort();
	// tslint:disable-next-line: no-console
	console.log(`Server is running on localhost:${port}`);
	const app = server.start({
		cors,
		port,
	});
	return app;
};
