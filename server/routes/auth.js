const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../server_config/config');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
    const r = Router();
r.post(
        '/login',
        endpoint(async (req) => {
            const { username, password } = req.body;
            if (!username || !password) {
                const error = new Error('Имя пользователя и пароль обязательны');
                error.status = 400;
                throw error;
            }
            const users = await query(
                `SELECT id, username, password_hash, email, is_active 
                 FROM admins 
                 WHERE username = ? OR email = ?`,
                [username, username]
            );

            if (users.length === 0) {
                const error = new Error('Неверное имя пользователя или пароль');
                error.status = 401;
                throw error;
            }

            const user = users[0];
            if (!user.is_active) {
                const error = new Error('Аккаунт деактивирован. Обратитесь к администратору.');
                error.status = 403;
                throw error;
            }
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                const error = new Error('Неверное имя пользователя или пароль');
                error.status = 401;
                throw error;
            }
            await query(
                `UPDATE admins SET last_login = NOW() WHERE id = ?`,
                [user.id]
            );
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: true,
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            };
        })
    );
r.post(
        '/logout',
        authenticateToken,
        endpoint(async (req) => {
            return {
                success: true,
                message: 'Выход выполнен успешно',
            };
        })
    );
r.get(
        '/verify',
        authenticateToken,
        endpoint(async (req) => {
            const users = await query(
                `SELECT id, username, email, created_at, last_login, is_active 
                 FROM admins 
                 WHERE id = ? AND is_active = 1`,
                [req.user.id]
            );

            if (users.length === 0) {
                throw new Error('Пользователь не найден или деактивирован');
            }

            return {
                success: true,
                user: {
                    id: users[0].id,
                    username: users[0].username,
                    email: users[0].email,
                    created_at: users[0].created_at,
                    last_login: users[0].last_login,
                },
            };
        })
    );
r.post(
        '/change-password',
        authenticateToken,
        endpoint(async (req) => {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                throw new Error('Текущий и новый пароль обязательны');
            }

            if (newPassword.length < 6) {
                throw new Error('Новый пароль должен содержать минимум 6 символов');
            }
            const users = await query(
                `SELECT password_hash FROM admins WHERE id = ?`,
                [req.user.id]
            );

            if (users.length === 0) {
                throw new Error('Пользователь не найден');
            }
            const isValidPassword = await bcrypt.compare(
                currentPassword,
                users[0].password_hash
            );

            if (!isValidPassword) {
                throw new Error('Неверный текущий пароль');
            }
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            await query(
                `UPDATE admins SET password_hash = ? WHERE id = ?`,
                [newPasswordHash, req.user.id]
            );

            return {
                success: true,
                message: 'Пароль успешно изменен',
            };
        })
    );

    return r;
};
