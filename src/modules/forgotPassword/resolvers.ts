import { USER_SESSION_ID_PREFIX, REDIS_SESSION_PREFIX } from './../../utils/constants';
import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy Query 1"
  },
  Mutation: {
    sendForgotPasswordLink: async (_, __, ___) => {
      return null;
    },
    setNewPassword: async (_, __, ___) => {
      return null;
    }
  }
}