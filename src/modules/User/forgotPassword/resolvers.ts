import { formatYupError } from '../../../utils/formatYupError';
import { EXPIRED_KEY_ERROR } from '../../../utils/commonErrors';
import { removeAllUsersSession, createForgotPasswordLink } from '../../../utils/utils';
import { USER_NOT_FOUND } from './errorMessages';
import { User } from '../../../entity/User';
import { registerPasswordSchema } from '../../../utils/yupSchemas';
import { ResolverMap } from '../../../types/graphql-utils';
import { FORGOT_PASSWORD_PREFIX } from '../../../utils/constants';
import { GQL } from '../../../types/schema';
import * as yup from 'yup';
import * as bcrypt from 'bcrypt';

const validateSchema = yup.object().shape({
  newPassword: registerPasswordSchema
})

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordLink: async (_, { email }: GQL.ISendForgotPasswordLinkOnMutationArguments, { redis }) => {
      const user = await User.findOne({
        where: { email }
      })
      if (!user) {
        return {
          path: "sendForgotPasswordLink",
          message: USER_NOT_FOUND
        }
      }

      await removeAllUsersSession(user.id, redis);
      //todo add frontend url
      await createForgotPasswordLink('', user.id, redis);
      //todo send email
      return true;
    },
    forgotPasswordChange: async (_, { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments, { redis }) => {
      const redisKey = `${FORGOT_PASSWORD_PREFIX}${key}`;
      const userId = await redis.get(redisKey);
      if (!userId) {
        return [
          {
            path: "key",
            message: EXPIRED_KEY_ERROR
          }
        ]
      }
      try {
        await validateSchema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatePromise = User.update({ id: userId }, { password: hashedPassword });
      const deleteKeyPromise = redis.del(redisKey);
      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    }
  }
}