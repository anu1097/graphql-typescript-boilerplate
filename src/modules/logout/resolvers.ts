import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    hi: () => "hi"
  },
  Mutation: {
    logout: (_, __, { session }) => {
      return new Promise(res =>
        session.destroy(err => {
          if(err){
            console.log(err);
          }
          res(true);
        }
      ))
    }
  }
}