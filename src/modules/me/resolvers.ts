import { middleWare } from './../../utils/utils';
import { User } from './../../entity/User';
import { createMiddleWare } from '../../utils/utils';
import { ResolverMap } from '../../types/graphql-utils';


export const resolvers: ResolverMap = {
  Query: {
    me: createMiddleWare(middleWare, (_, __, { session }) =>
      User.findOne({ where: { id: session.userId } })
    )
  }
}