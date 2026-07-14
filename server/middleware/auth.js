const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../server_config/config');
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    const cookieToken = req.cookies?.adminToken || token;

    if (!cookieToken) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Токен доступа отсутствует. Пожалуйста, войдите в систему.' 
        });
    }

    jwt.verify(cookieToken, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'Недействительный или истекший токен. Пожалуйста, войдите снова.' 
            });
        }
        req.user = user;
        next();
    });
};
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Доступ запрещен. Требуются права администратора.' 
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
};
