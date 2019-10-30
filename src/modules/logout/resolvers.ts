import { USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from './../../utils/constants';
import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    hi: () => "hi"
  },
  Mutation: {
    logout: async (_, __, { req, redis }) => {
      const { session } = req
      const { userId } = session;

      if (userId) {
        const sessionIds = await redis.lrange(`${USER_SESSION_ID_PREFIX}${userId}`, 0, -1)

        const promises = [];
        sessionIds.forEach(sessionId => {
          promises.push(redis.del(`${REDIS_SESSION_PREFIX}${sessionId}`));
        });
        await Promise.all(promises);
        return true;
      }
      return false;
    }
  }
}