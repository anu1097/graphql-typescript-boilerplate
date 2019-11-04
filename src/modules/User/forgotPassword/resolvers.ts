import * as bcrypt from "bcrypt";
import * as yup from "yup";
import { User } from "../../../entity/User";
import { IResolverMap } from "../../../types/graphql-utils";
import { GQL } from "../../../types/schema";
import { EXPIRED_KEY_ERROR } from "../../../utils/commonErrors";
import { FORGOT_PASSWORD_PREFIX } from "../../../utils/constants";
import { formatYupError } from "../../../utils/formatYupError";
import { createForgotPasswordLink, removeAllUsersSession } from "../../../utils/utils";
import { registerPasswordSchema } from "../../../utils/yupSchemas";
import { USER_NOT_FOUND } from "./errorMessages";

const validateSchema = yup.object().shape({
	newPassword: registerPasswordSchema,
});

export const resolvers: IResolverMap = {
	Mutation: {
		forgotPasswordChange: async (_, { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments, { redis }) => {
			const redisKey = `${FORGOT_PASSWORD_PREFIX}${key}`;
			const userId = await redis.get(redisKey);
			if (!userId) {
				return [
					{
						message: EXPIRED_KEY_ERROR,
						path: "key",
					},
				];
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
		},
		sendForgotPasswordLink: async (_, { email }: GQL.ISendForgotPasswordLinkOnMutationArguments, { redis }) => {
			const user = await User.findOne({
				where: { email },
			});
			if (!user) {
				return {
					message: USER_NOT_FOUND,
					path: "sendForgotPasswordLink",
				};
			}

			await removeAllUsersSession(user.id, redis);
			// todo add frontend url
			await createForgotPasswordLink("", user.id, redis);
			// todo send email
			return true;
		},
	},
};
