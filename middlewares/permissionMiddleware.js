const requireRole = (rolesArray) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ success: false, message: 'Forbidden. No roles assigned.' });
        }

        const hasRole = req.user.roles.some(role => rolesArray.includes(role) || role === 'super_admin');
        if (!hasRole) {
            return res.status(403).json({ success: false, message: 'Forbidden. Insufficient role.' });
        }
        next();
    };
};

const requirePermission = (permissionString) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ success: false, message: 'Forbidden. No permissions assigned.' });
        }

        // Super Admin ทะลุได้ทุกสิทธิ์
        if (req.user.roles && req.user.roles.includes('super_admin')) {
            return next();
        }

        if (!req.user.permissions.includes(permissionString)) {
            return res.status(403).json({ success: false, message: `Forbidden. Requires permission: ${permissionString}` });
        }
        next();
    };
};

module.exports = {
    requireRole,
    requirePermission
};
