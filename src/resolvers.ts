import { User } from './entity/User';
import * as bcrypt from 'bcrypt';
import { ResolverMap } from './types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    hello: (_: any, { name }: GQL.IHelloOnQueryArguments) => `Hello ${name || 'World'}`,
  },
  Mutation: {
    register: async (_,
      { email, password }: GQL.IRegisterOnMutationArguments) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      })
      await user.save();
      return true;
    }
  }
}