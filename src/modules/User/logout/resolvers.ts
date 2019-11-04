import { IResolverMap } from "../../../types/graphql-utils";
import { removeAllUsersSession } from "../../../utils/utils";

export const resolvers: IResolverMap = {
	Mutation: {
		logout: async (_, __, { req, redis }) => {
			const { session } = req;
			const { userId } = session;

			if (userId) {
				await removeAllUsersSession(userId, redis);
				return true;
			}
			return false;
		},
	},
};
