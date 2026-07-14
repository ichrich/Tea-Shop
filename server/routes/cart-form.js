const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { body, validationResult } = require('express-validator');
const { sendFormEmail } = require('../utils/mailer');
const { createRequestId, enqueueFormSubmission } = require('../utils/formQueue');
module.exports = (query) => {
    const r = Router();
r.post(
        '/',
        [
            body('name').trim().notEmpty().withMessage('Имя обязательно для заполнения'),
            body('surname').trim().notEmpty().withMessage('Фамилия обязательна для заполнения'),
            body('phone').trim().notEmpty().withMessage('Телефон обязателен для заполнения'),
            body('email').trim().isEmail().withMessage('Необходимо ввести корректный email'),
            body('address').trim().notEmpty().withMessage('Адрес обязателен для заполнения'),
            body('delivery').trim().notEmpty().withMessage('Способ доставки обязателен для выбора'),
            body('cartItems').isArray().notEmpty().withMessage('Корзина не должна быть пустой'),
            body('cartItems.*.id').notEmpty().withMessage('ID товара обязателен'),
            body('cartItems.*.name').trim().notEmpty().withMessage('Название товара обязательно'),
            body('cartItems.*.quantity').isInt({ min: 1 }).withMessage('Количество должно быть больше 0'),
            body('cartItems.*.price').isNumeric().withMessage('Цена должна быть числом'), // Добавлена валидация цены
            body('agreedToTerms').isBoolean().withMessage('Необходимо принять условия соглашения'),
        ],
        endpoint(async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { name, surname, phone, email, address, delivery, cartItems, agreedToTerms } = req.body;
            try {
                const requestId = createRequestId('ORDER');
                const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const payload = { name, surname, phone, email, address, delivery, cartItems, agreedToTerms, totalPrice };
                let orderId = null;
                let storedInDatabase = false;

                try {
                    const orderResult = await query(
                        `
                        INSERT INTO orders (name, surname, phone, email, address, delivery, total_price, agreed_to_terms)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                        [name, surname, phone, email, address, delivery, totalPrice, agreedToTerms]
                    );
                    orderId = orderResult.insertId;
                    for (const item of cartItems) {
                        await query(
                            `UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?`,
                            [item.quantity, item.id, item.quantity]
                        );
                        await query(
                            `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, date)
                             VALUES (?, ?, ?, ?, ?, NOW())`,
                            [orderId, item.id, item.name, item.quantity, item.price]
                        );
                    }
                    storedInDatabase = true;
                } catch (databaseError) {
                    console.warn(`[forms:${requestId}] order database unavailable, using queue:`, databaseError.code || databaseError.message);
                }

                let emailSent = false;
                try {
                    const emailResult = await sendFormEmail({
                        subject: `Новый заказ ${orderId ? `#${orderId}` : requestId}`,
                        text:
                            `Заказ: ${orderId || requestId}\n` +
                            `Покупатель: ${name} ${surname}\n` +
                            `Телефон: ${phone}\nEmail: ${email}\n` +
                            `Адрес: ${address}\nДоставка: ${delivery}\n` +
                            `Сумма: ${totalPrice}\n` +
                            `Товары: ${cartItems.map((i) => `${i.name} x${i.quantity}`).join(', ')}`,
                    });
                    emailSent = Boolean(emailResult?.sent);
                } catch (emailError) {
                    console.warn(`[forms:${requestId}] order email failed:`, emailError.code || emailError.message);
                }

                const queued = !storedInDatabase && !emailSent;
                if (queued) await enqueueFormSubmission('order', payload, requestId);

                return res.status(queued ? 202 : 201).json({
                    message: queued
                        ? 'Заказ принят. Мы свяжемся с вами для подтверждения.'
                        : 'Заказ успешно оформлен',
                    requestId,
                    orderId,
                    delivery: queued ? 'queued' : 'accepted',
                });
            } catch (error) {
                console.error('Ошибка при оформлении заказа:', error);
                return res.status(500).json({ message: 'Произошла ошибка при оформлении заказа' });
            }
        })
    );
    return r;
};
