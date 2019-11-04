import * as bcrypt from "bcrypt";
import * as yup from "yup";
import { User } from "../../../entity/User";
import { IResolverMap } from "../../../types/graphql-utils";
import { GQL } from "../../../types/schema";
import { INVALID_EMAIL } from "../../../utils/commonErrors";
import { USER_SESSION_ID_PREFIX } from "../../../utils/constants";
import { formatYupError } from "../../../utils/formatYupError";
import { registerEmailSchema, registerPasswordSchema } from "../../../utils/yupSchemas";
import { accountLockedError, emailConfirmError, invalidLogin } from "./errorMessages";

const validateSchema = yup.object().shape({
	email: registerEmailSchema,
	password: registerPasswordSchema,
});

const errorResponse = (error) => {
	return [{
		message: error,
		path: "Login",
	}];
};

export const resolvers: IResolverMap = {
	Mutation: {
		login: async (
			_,
			args: GQL.ILoginOnMutationArguments,
			{
				req,
				redis,
			},
		) => {
			const { session } = req;
			try {
				await validateSchema.validate(args, { abortEarly: false });
			} catch (err) {
				return formatYupError(err);
			}
			const { email, password } = args;
			const user = await User.findOne({
				where: { email },
			});
			if (!user) {
				return errorResponse(invalidLogin);
			}
			if (!user.confirmed) {
				return errorResponse(emailConfirmError);
			}
			if (user.lockedAccount) {
				return errorResponse(accountLockedError);
			}
			const valid = await bcrypt.compare(password, user.password);
			if (!valid) { return errorResponse(invalidLogin); }
			session.userId = user.id;
			if (req.sessionID) {
				redis.lpush(`${USER_SESSION_ID_PREFIX}${user.id}`, req.sessionID);
			}
			return null;
		},
	},
};
