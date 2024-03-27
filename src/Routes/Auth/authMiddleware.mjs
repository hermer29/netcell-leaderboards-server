import User from '../../Models/User.mjs';

export const authMiddleware = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.status(403).send();
	}
};

export const createAdminUser = async () => {
	try {
		const adminUser = new User({
			username: process.env.ADMIN_USERNAME,
			displayName: 'Admin',
		});
		await User.register(adminUser, process.env.ADMIN_PASSWORD);
	} catch(err) {
		// console.warn(err);
	}
};

export const adminMiddleware = (req, res, next) => {
	if (req.isAuthenticated() && req.user.username == process.env.ADMIN_USERNAME) {
		return next();
	} else {
		res.status(403).send();
	}
};
