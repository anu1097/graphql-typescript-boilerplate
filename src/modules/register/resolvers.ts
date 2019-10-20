import { User } from '../../entity/User';
import * as bcrypt from 'bcrypt';
import { ResolverMap } from '../../types/graphql-utils';

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (_,
      { email, password }: GQL.IRegisterOnMutationArguments) => {
      const userAllReadyExists = await User.findOne({
        where: { email },
        select: ["id"] 
      })
      if (userAllReadyExists) {
        return [
          {
            path: "email",
            message: "user allready exists"
          }
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      })
      await user.save();
      return null;
    }
  }
}