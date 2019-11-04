import { registerEmailSchema, registerPasswordSchema } from '../../../utils/yupSchemas';
import { USER_SESSION_ID_PREFIX } from '../../../utils/constants';
import { invalidLogin, emailConfirmError, accountLockedError } from './errorMessages';
import { INVALID_EMAIL } from '../../../utils/commonErrors';
import { User } from '../../../entity/User';
import * as bcrypt from 'bcrypt';
import { ResolverMap } from '../../../types/graphql-utils';
import * as yup from 'yup';
import { formatYupError } from '../../../utils/formatYupError';
import { GQL } from '../../../types/schema';

const validateSchema = yup.object().shape({
  email: registerEmailSchema,
  password: registerPasswordSchema
})

const errorResponse = (errorResponse) => {
  return [{
    path: "Login",
    message: errorResponse
  }];
}

export const resolvers: ResolverMap = {
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
        await validateSchema.validate(args, { abortEarly: false })
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
      if (user.lockedAccount) {
        return errorResponse(accountLockedError)
      }
      const valid = await bcrypt.compare(password, user.password);
      // console.log(password);
      // console.log(valid);
      if (!valid) return errorResponse(invalidLogin);
      session.userId = user.id;
      if (req.sessionID) {
        redis.lpush(`${USER_SESSION_ID_PREFIX}${user.id}`, req.sessionID)
      }
      return null;
    }
  }
} 