const { StoreUser } = require("../models");

const checkStorePermissions = (requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            const { storeId } = req.params;
            const userAddress = req.user.walletAddress;

            // Find user's store role
            const storeUser = await StoreUser.findOne({
                where: { storeId, userAddress }
            });

            if (!storeUser) {
                return res.status(403).json({ error: "No access to this store" });
            }

            // If no specific permissions required, just check if user has any role in store
            if (requiredPermissions.length === 0) {
                if (storeUser.status === 'active') {
                    return next();
                }
                return res.status(403).json({ error: "User is not active in this store" });
            }

            // Check if user has all required permissions
            const hasAllPermissions = requiredPermissions.every(
                permission => storeUser.permissions[permission] === true
            );

            if (!hasAllPermissions) {
                return res.status(403).json({ error: "Insufficient permissions" });
            }

            // Add store user to request for potential use in controllers
            req.storeUser = storeUser;
            next();
        } catch (error) {
            res.status(500).json({ error: "Error checking permissions" });
        }
    };
};

module.exports = {
    checkStorePermissions
}; 