import { Redis } from "ioredis";

export interface IContext {
	redis: Redis;
	url: string;
	req: Express.Request;
}

export type Resolver = (
	parent: any,
	args: any,
	context: IContext,
	info: any,
) => any;

export type GraphQlMiddleware = (
	resolver: Resolver,
	parent: any,
	args: any,
	context: IContext,
	info: any,
) => any;

export interface IResolverMap {
	[key: string]: {
		[key: string]: Resolver,
	};
}
