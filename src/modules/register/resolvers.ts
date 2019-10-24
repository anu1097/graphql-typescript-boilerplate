import { createEmailConfirmationLink } from './../../utils/utils';
import { User } from '../../entity/User';
import * as bcrypt from 'bcrypt';
import { ResolverMap } from '../../types/graphql-utils';
import * as yup from 'yup';
import { formatYupError } from '../../utils/formatYupError';
import { invalidEmail, duplicateEmail } from './errorMessages';
import { GQL } from '../../types/schema';
 
const validSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(invalidEmail),
  password: yup.string().min(3).max(255)
})

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (_,
      args: GQL.IRegisterOnMutationArguments, {redis, url}) => {
      try {
        await validSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return formatYupError(err);
      }
      const { email, password } = args;
      const userAllReadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      })
      if (userAllReadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      })
      await createEmailConfirmationLink(url, user.id, redis);
      await user.save();
      return null;
    }
  }
}