export const authMiddleware = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.status(403).send();
	}
};