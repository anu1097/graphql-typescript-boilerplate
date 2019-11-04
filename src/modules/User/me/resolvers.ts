import { User } from "../../../entity/User";
import { IResolverMap } from "../../../types/graphql-utils";
import { createMiddleWare, middleWare } from "../../../utils/utils";

export const resolvers: IResolverMap = {
	Query: {
		me: createMiddleWare(middleWare, (_, __, { req }) => {
			const { session } = req;
			return User.findOne({ where: { id: session.userId } });
		}),
	},
};
