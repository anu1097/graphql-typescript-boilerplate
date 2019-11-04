import * as yup from "yup";
import { User } from "../../../entity/User";
import { IResolverMap } from "../../../types/graphql-utils";
import { GQL } from "../../../types/schema";
import { formatYupError } from "../../../utils/formatYupError";
import { sendConfirmationEmail } from "../../../utils/sendConfirmationEmail";
import { createEmailConfirmationLink } from "../../../utils/utils";
import { registerEmailSchema, registerPasswordSchema } from "../../../utils/yupSchemas";
import { duplicateEmail } from "./errorMessages";

const validateSchema = yup.object().shape({
	email: registerEmailSchema,
	password: registerPasswordSchema,
});

export const resolvers: IResolverMap = {
	Mutation: {
		register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
			try {
				await validateSchema.validate(args, { abortEarly: false });
			} catch (err) {
				return formatYupError(err);
			}
			const { email, password } = args;
			const userAllReadyExists = await User.findOne({
				select: ["id"],
				where: { email },
			});
			if (userAllReadyExists) {
				return [
					{
						message: duplicateEmail,
						path: "email",
					},
				];
			}
			const user = await User.create({
				email,
				password,
			}).save();

			// if (process.env.NODE_ENV !== "test") {
			//   await sendConfirmationEmail(
			//     email,
			//     await createEmailConfirmationLink(url, user.id, redis)
			//   );
			// }
			return null;
		},
	},
};
