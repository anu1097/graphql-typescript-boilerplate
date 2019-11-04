import { User } from "./../entity/User";
import { redisInstance } from "./../redis_utility";

export const confirmEmail = async (req, res) => {
	const {id} = req.params;
	const redis = redisInstance;
	const userID = await redis.get(id);
	if (userID) {
		await User.update({id: userID}, {confirmed: true});
		await redis.del(id);
		res.send("ok");
	} else {
		res.send("UserId invalid");
	}
};
