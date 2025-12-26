module.exports = function adminOnly(req, res, next) {
    if (!req.user.role.includes("ADMIN")) {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
};
