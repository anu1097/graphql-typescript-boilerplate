import { User } from './../../entity/User';
import middleWare from './middleWare';
import { ResolverMap } from '../../types/graphql-utils';
import { createMiddleWare } from '../../utils/utils';


export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleWare(middleWare, (_, __, { session }) =>
      User.findOne({ where: { id: session.userId } })
    )
  }
}