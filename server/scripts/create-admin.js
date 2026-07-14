const bcrypt = require('bcrypt');
const { initPool, query } = require('../server_config/db');

async function createAdmin() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Использование: node create-admin.js <username> <password> [email]');
        console.error('Пример: node create-admin.js admin admin123 admin@example.com');
        process.exit(1);
    }

    const [username, password, email] = args;

    if (password.length < 6) {
        console.error('Ошибка: Пароль должен содержать минимум 6 символов');
        process.exit(1);
    }

    try {
        await initPool();
        try {
            await query('SELECT 1 FROM admins LIMIT 1');
        } catch (err) {
            console.log('Таблица admins не найдена. Создаем таблицу...');
            await query(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INT NOT NULL AUTO_INCREMENT,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    email VARCHAR(255) DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL DEFAULT NULL,
                    is_active TINYINT(1) DEFAULT 1,
                    PRIMARY KEY (id),
                    KEY idx_username (username),
                    KEY idx_email (email)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
            `);
            console.log('Таблица admins создана успешно.');
        }
        const existing = await query(
            'SELECT id FROM admins WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            console.log(`Пользователь "${username}" уже существует. Обновляем пароль...`);
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            await query(
                'UPDATE admins SET password_hash = ?, email = ?, is_active = 1 WHERE username = ?',
                [passwordHash, email || null, username]
            );
            console.log(`Пароль для пользователя "${username}" успешно обновлен.`);
        } else {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            await query(
                'INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)',
                [username, passwordHash, email || null]
            );
            
            console.log(`Администратор "${username}" успешно создан.`);
        }

        console.log('\nУчетные данные:');
        console.log(`  Username: ${username}`);
        console.log(`  Password: ${password}`);
        if (email) {
            console.log(`  Email: ${email}`);
        }
        console.log('\nВНИМАНИЕ: Сохраните эти данные в безопасном месте!');
        console.log('Рекомендуется изменить пароль после первого входа.');

        process.exit(0);
    } catch (err) {
        console.error('Ошибка при создании администратора:', err);
        process.exit(1);
    }
}

createAdmin();
