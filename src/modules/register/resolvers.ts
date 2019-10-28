import { invalidEmail } from './../../utils/commonErrors';
import { User } from '../../entity/User';
import { ResolverMap } from '../../types/graphql-utils';
import * as yup from 'yup';
import { formatYupError } from '../../utils/formatYupError';
import { duplicateEmail } from './errorMessages';
import { GQL } from '../../types/schema';
import { createEmailConfirmationLink } from './../../utils/utils';
import { sendConfirmationEmail } from '../../utils/sendConfirmationEmail';

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
      args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
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
      const user = await User.create({
        email,
        password
      }).save();

      // if (process.env.NODE_ENV !== "test") {
      //   await sendConfirmationEmail(
      //     email,
      //     await createEmailConfirmationLink(url, user.id, redis)
      //   ); 
      // }
      return null;
    }
  }
}