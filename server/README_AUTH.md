# Система аутентификации администратора

## Установка и настройка

### 1. Установка зависимостей

```bash
cd server
npm install bcrypt jsonwebtoken cookie-parser
```

### 2. Создание таблицы администраторов

Таблица `admins` будет создана автоматически при первом запуске скрипта создания администратора.

Или выполните SQL скрипт вручную:
```sql
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 3. Создание первого администратора

```bash
node scripts/create-admin.js <username> <password> [email]
```

Пример:
```bash
node scripts/create-admin.js admin admin123 admin@example.com
```

**ВАЖНО:** После первого входа рекомендуется изменить пароль через админ-панель.

## Безопасность

### Реализованные меры защиты:

1. **Хеширование паролей** - используется bcrypt с 10 раундами
2. **JWT токены** - для аутентификации используются JSON Web Tokens
3. **Защита маршрутов** - все админские API защищены middleware `authenticateToken`
4. **Валидация входных данных** - проверка обязательных полей
5. **Защита от SQL инъекций** - используются параметризованные запросы
6. **CORS настройки** - настроены для работы с фронтендом
7. **Токены в заголовках** - токены передаются через Authorization header

### Защищенные маршруты:

- `/api/adminProducts` - управление товарами
- `/api/adminArticles` - управление статьями
- `/api/articleSections` - управление разделами статей
- `/api/addProduct` - добавление товаров
- `/api/delete` - удаление данных
- `/api/dashBoard` - дашборд
- `/api/dataPercent` - статистика
- `/api/grapfic` - графики
- `/api/topProduct` - топ товары
- `/api/cerf` - сертификаты
- `/api/products/:id/toggle` - переключение статуса товара

### Публичные маршруты (не требуют аутентификации):

- `/api/auth/login` - вход в систему
- `/api/auth/logout` - выход из системы
- `/api/auth/verify` - проверка токена (требует токен)
- Все остальные публичные API (blog, hero, partners, etc.)

## API Endpoints

### POST /api/auth/login
Вход в систему

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

### POST /api/auth/logout
Выход из системы (требует токен)

### GET /api/auth/verify
Проверка валидности токена и получение данных пользователя (требует токен)

### POST /api/auth/change-password
Изменение пароля (требует токен)

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Конфигурация

Настройки JWT находятся в `server/server_config/config.js`:

```javascript
JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-2024',
JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
```

**ВАЖНО:** В production обязательно установите переменную окружения `JWT_SECRET` с надежным случайным ключом!

## Использование на фронтенде

Все API запросы в админ-панели должны использовать утилиту `apiRequest` или `apiJson` из `src/utils/api.js`, которая автоматически добавляет токен в заголовки.

Пример:
```javascript
import { apiJson } from '../utils/api';

const data = await apiJson('/api/adminProducts');
```

## Troubleshooting

### Ошибка "Unauthorized" при запросах
- Проверьте, что токен сохранен в localStorage
- Проверьте, что токен передается в заголовке Authorization
- Убедитесь, что токен не истек (по умолчанию 24 часа)

### Ошибка при создании администратора
- Убедитесь, что таблица `admins` создана
- Проверьте подключение к БД
- Убедитесь, что пароль содержит минимум 6 символов
