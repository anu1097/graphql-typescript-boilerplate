import { USER_SESSION_ID_PREFIX } from './../../utils/constants';
import { invalidLogin, emailConfirmError } from './errorMessages';
import { invalidEmail } from './../../utils/commonErrors';
import { User } from '../../entity/User';
import * as bcrypt from 'bcrypt';
import { ResolverMap } from '../../types/graphql-utils';
import * as yup from 'yup';
import { formatYupError } from '../../utils/formatYupError';
import { GQL } from '../../types/schema';

const validSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(invalidEmail),
  password: yup.string().min(3).max(255)
})

const errorResponse = (errorResponse) => {
  return [{
    path: "Login",
    message: errorResponse
  }];
}

export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "bye"
  },
  Mutation: {
    login: async (
      _,
      args: GQL.ILoginOnMutationArguments,
      {
        req,
        redis
      }
    ) => {
      const { session } = req;
      try {
        await validSchema.validate(args, { abortEarly: false })
      } catch (err) {
        return formatYupError(err);
      }
      const { email, password } = args;
      const user = await User.findOne({
        where: { email },
      })
      if (!user) {
        return errorResponse(invalidLogin);
      }
      if (!user.confirmed) {
        return errorResponse(emailConfirmError)
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return errorResponse(invalidLogin);
      session.userId = user.id;
      if (req.sessionID) {
        redis.lpush(`${USER_SESSION_ID_PREFIX}${user.id}`, req.sessionID)
      }
      return null;
    }
  }
}